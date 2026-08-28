'use client';

import { create } from 'zustand';
import { AGENTS, resolveSystemPrompt, resolveIntroduction, type AgentId, type ProductAgent } from './agents';
import { AVATARS, getAvatar, type AvatarId, type AvatarIdentity } from './avatars';
import { LANGUAGES, getLanguage, type LanguageId, type Language } from './languages';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId: AgentId;
  avatarId: AvatarId;
  languageId: LanguageId;
  audioUrl?: string; // object URL for cached TTS audio
  pendingAudio?: boolean;
  ttsFailed?: boolean; // true if TTS failed for this message (text is still visible)
  createdAt: number;
}

type Phase = 'idle' | 'thinking' | 'speaking';

/**
 * amplitudeCallback — a function that receives the current audio
 * amplitude (0..1) ~30 times per second while the avatar is speaking.
 * The TalkingMouth subscribes via `setAmplitudeCallback` and uses the
 * value to drive its mouth opening size in real time, instead of using
 * random visemes.
 */
type AmplitudeCallback = (amp: number) => void;

interface AvatarState {
  sessionId: string;
  currentAvatar: AvatarIdentity;
  currentAgent: ProductAgent;
  currentLanguage: Language;
  messages: ChatMessage[];
  phase: Phase;
  error: string | null;
  autoSpeak: boolean;
  muted: boolean;
  // ref-style state (non-serializable but fine for zustand)
  audioEl: HTMLAudioElement | null;
  // Audio analysis nodes for real-time amplitude tracking (Option A lip sync)
  audioCtx: AudioContext | null;
  analyser: AnalyserNode | null;
  sourceNode: MediaElementAudioSourceNode | null;
  amplitudeCallback: AmplitudeCallback | null;
  // Track which agents have been introduced (so we don't repeat the intro)
  introducedAgents: Set<AgentId>;

  setAvatar: (id: AvatarId) => void;
  setAgent: (id: AgentId) => void;
  setLanguage: (id: LanguageId) => void;
  toggleAutoSpeak: () => void;
  toggleMuted: () => void;
  setAudioEl: (el: HTMLAudioElement | null) => void;
  setAmplitudeCallback: (cb: AmplitudeCallback | null) => void;
  setPhase: (p: Phase) => void;
  setError: (e: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  replay: (messageId: string) => Promise<void>;
  playIntroduction: () => Promise<void>;
  stopSpeaking: () => void;
  clearChat: () => void;
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeSessionId() {
  if (typeof window === 'undefined') return 'ssr-' + Math.random().toString(36).slice(2);
  const key = 'avatar_session_id';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = 's-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

async function fetchTTS(text: string, agent: ProductAgent): Promise<Blob> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, agentId: agent.id, voice: agent.voice, speed: agent.speed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `TTS failed (${res.status})`);
  }
  const blob = await res.blob();
  // If the response isn't actually audio (e.g. a JSON error sneaked through),
  // throw so the caller can handle it gracefully.
  if (!blob.type.startsWith('audio/') && blob.size < 1000) {
    const text = await blob.text();
    throw new Error(text.slice(0, 100) || 'Invalid audio response');
  }
  return blob;
}

/**
 * Lazily set up the Web Audio API analyser on the first user-initiated
 * playback. This MUST be called from within a user-gesture call stack
 * (e.g. the click handler that triggered sendMessage). Returns true if
 * the analyser is ready (or was already set up).
 */
function ensureAnalyser(get: () => AvatarState, set: (fn: Partial<AvatarState>) => void): boolean {
  const state = get();
  if (state.analyser && state.audioCtx) return true;
  if (!state.audioEl) return false;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;
    const audioCtx = new Ctx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    const sourceNode = audioCtx.createMediaElementSource(state.audioEl);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    set({ audioCtx, analyser, sourceNode });
    startAmplitudeLoop(get);
    return true;
  } catch {
    return false;
  }
}

/**
 * Amplitude sampling loop — runs forever once started, reads the analyser
 * ~30 times per second and dispatches the current RMS amplitude (0..1) to
 * the registered amplitudeCallback. The TalkingMouth subscribes to this
 * so its mouth opening tracks the actual TTS audio loudness in real time.
 *
 * Only dispatches when phase === 'speaking' to save CPU when idle.
 */
function startAmplitudeLoop(get: () => AvatarState) {
  const buffer = new Uint8Array(128); // analyser.frequencyBinCount = fftSize/2 = 128
  const loop = () => {
    const state = get();
    if (state.analyser && state.phase === 'speaking' && state.amplitudeCallback) {
      state.analyser.getByteFrequencyData(buffer);
      // Compute RMS-ish amplitude from the low-mid frequencies (vocal range).
      // We use bins 1..40 (~ 90Hz–3.5kHz at 24kHz sample rate) which
      // captures speech energy well.
      let sum = 0;
      let count = 0;
      for (let i = 1; i < 40 && i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
        count++;
      }
      const rms = Math.sqrt(sum / count) / 255; // normalize to 0..1
      // Apply a curve so quiet speech still moves the mouth but loud peaks
      // don't max out — gives a more natural range.
      const shaped = Math.pow(Math.min(rms * 2.2, 1), 0.7);
      state.amplitudeCallback(shaped);
    } else if (state.amplitudeCallback && state.phase !== 'speaking') {
      // When not speaking, send 0 so the mouth rests
      state.amplitudeCallback(0);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  sessionId: typeof window !== 'undefined' ? makeSessionId() : 'ssr',
  currentAvatar: AVATARS[0],
  currentAgent: AGENTS.find((a) => a.id === 'company') ?? AGENTS[0],
  currentLanguage: LANGUAGES[0],
  messages: [],
  phase: 'idle',
  error: null,
  autoSpeak: true,
  muted: false,
  audioEl: null,
  audioCtx: null,
  analyser: null,
  sourceNode: null,
  amplitudeCallback: null,
  introducedAgents: new Set(),

  setAvatar: (id) => {
    const avatar = getAvatar(id);
    set({ currentAvatar: avatar, phase: 'idle', error: null });
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  },

  setAgent: (id) => {
    const agent = AGENTS.find((a) => a.id === id) ?? AGENTS[0];
    set({ currentAgent: agent, phase: 'idle', error: null });
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    // Trigger the agent's spoken introduction (async, non-blocking)
    setTimeout(() => {
      get().playIntroduction();
    }, 300);
  },

  setLanguage: (id) => {
    const language = getLanguage(id);
    set({ currentLanguage: language, phase: 'idle', error: null });
  },

  toggleAutoSpeak: () => set((s) => ({ autoSpeak: !s.autoSpeak })),
  toggleMuted: () => {
    const muted = !get().muted;
    const el = get().audioEl;
    if (el) el.muted = muted;
    set({ muted });
  },
  setAudioEl: (el) => {
    // Just store the element — we'll set up the AudioContext lazily on
    // the first user-initiated play (in playReply), because browsers
    // require AudioContext + createMediaElementSource to happen in
    // response to a user gesture. Creating them on mount leaves the
    // context suspended and breaks audio routing.
    set({ audioEl: el });
  },
  setAmplitudeCallback: (cb) => set({ amplitudeCallback: cb }),
  setPhase: (p) => set({ phase: p }),
  setError: (e) => set({ error: e }),

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { sessionId, currentAgent: agent, currentAvatar: avatar, currentLanguage: language, autoSpeak, muted } = get();

    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      agentId: agent.id,
      avatarId: avatar.id,
      languageId: language.id,
      createdAt: Date.now(),
    };
    const pendingAssistantId = makeId();
    const pendingMsg: ChatMessage = {
      id: pendingAssistantId,
      role: 'assistant',
      content: '',
      agentId: agent.id,
      avatarId: avatar.id,
      languageId: language.id,
      pendingAudio: autoSpeak && !muted,
      createdAt: Date.now() + 1,
    };

    set((s) => ({
      messages: [...s.messages, userMsg, pendingMsg],
      phase: 'thinking',
      error: null,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          agentId: agent.id,
          avatarName: avatar.name,
          languageId: language.id,
          message: trimmed,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Chat failed (${res.status})`);
      }
      const data = await res.json();
      const reply: string = data.reply || '...';

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingAssistantId ? { ...m, content: reply } : m
        ),
      }));

      if (autoSpeak && !muted) {
        await playReply(pendingAssistantId, reply, agent, set, get);
      } else {
        set({ phase: 'idle' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      set((s) => ({
        error: msg,
        phase: 'idle',
        messages: s.messages
          .filter((m) => m.id !== pendingAssistantId)
          .concat({
            id: makeId(),
            role: 'assistant',
            content: `\u26a0\ufe0f ${msg}`,
            agentId: agent.id,
            avatarId: avatar.id,
            languageId: language.id,
            createdAt: Date.now(),
          }),
      }));
    }
  },

  replay: async (messageId) => {
    const { messages, currentAgent, muted } = get();
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.role !== 'assistant' || !msg.content) return;
    if (muted) return;
    await playReply(messageId, msg.content, currentAgent, set, get);
  },

  playIntroduction: async () => {
    const { currentAgent: agent, currentAvatar: avatar, currentLanguage: language, muted, autoSpeak } = get();
    if (muted || !autoSpeak) return;
    // Check if this agent was already introduced in this session
    if (get().introducedAgents?.has(agent.id)) return;
    // Mark as introduced
    set((s) => ({
      introducedAgents: new Set(s.introducedAgents || []).add(agent.id),
    }));
    const introText = resolveIntroduction(agent, avatar.name);
    const introMsg: ChatMessage = {
      id: makeId(),
      role: 'assistant',
      content: introText,
      agentId: agent.id,
      avatarId: avatar.id,
      languageId: language.id,
      pendingAudio: true,
      createdAt: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, introMsg],
      phase: 'speaking',
      error: null,
    }));
    await playReply(introMsg.id, introText, agent, set, get);
  },

  stopSpeaking: () => {
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    set({ phase: 'idle' });
  },

  clearChat: () => {
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    set({ messages: [], phase: 'idle', error: null });
  },
}));

// Helper to fetch TTS, attach audio URL, play, and manage phase state.
// If TTS fails, we DON'T mark the message as errored — the text is still
// visible and the user can retry the voice via the Replay button.
async function playReply(
  messageId: string,
  text: string,
  agent: ProductAgent,
  set: (fn: Partial<AvatarState> | ((s: AvatarState) => Partial<AvatarState>)) => void,
  get: () => AvatarState
) {
  set({ phase: 'speaking' });
  try {
    const blob = await fetchTTS(text, agent);
    const url = URL.createObjectURL(blob);

    // Revoke any old audio URL on this message
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id === messageId) {
          if (m.audioUrl) URL.revokeObjectURL(m.audioUrl);
          return { ...m, audioUrl: url, pendingAudio: false, ttsFailed: false };
        }
        return m;
      }),
    }));

    const el = get().audioEl;
    if (!el) {
      set({ phase: 'idle' });
      return;
    }
    // Set up the Web Audio analyser on the first user-initiated playback.
    // This MUST happen within the user-gesture call stack (sendMessage →
    // playReply is triggered by a click). Now that the TTS route returns
    // clean WAV files (no AIGC chunk), the analyser + playback work together.
    ensureAnalyser(get, set);
    // Resume the AudioContext if it's suspended (autoplay policy).
    const audioCtx = get().audioCtx;
    if (audioCtx && audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch {
        // ignore — playback may still work without the analyser
      }
    }
    // Clear any stale error/network state from a previous playback attempt.
    el.onerror = null;
    el.onended = () => {
      if (get().phase === 'speaking') set({ phase: 'idle' });
    };
    el.src = url;
    el.muted = get().muted;
    el.load();
    el.onerror = () => {
      set({ phase: 'idle', error: 'Audio playback failed.' });
    };
    try {
      await el.play();
    } catch (playErr) {
      console.error('[playReply] audio.play() failed:', playErr);
      set({ phase: 'idle', error: 'Audio playback failed.' });
    }
  } catch (err: unknown) {
    // TTS failed but the text reply is still visible. Surface a non-fatal
    // toast-style error so the user knows voice failed and can retry.
    const msg = err instanceof Error ? err.message : 'Voice generation failed';
    set((s) => ({
      phase: 'idle',
      error: `Voice: ${msg}`,
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, pendingAudio: false, ttsFailed: true } : m
      ),
    }));
  }
}

// Re-export for components that still import from store
export { AGENTS, AVATARS, LANGUAGES, getAgent, getAvatar, getLanguage, resolveSystemPrompt };
export type { AgentId, AvatarId, AvatarIdentity, LanguageId, Language, ProductAgent };
