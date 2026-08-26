'use client';

import { create } from 'zustand';
import { AGENTS, type AgentId, type ProductAgent } from './agents';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId: AgentId;
  audioUrl?: string; // object URL for cached TTS audio
  pendingAudio?: boolean;
  createdAt: number;
}

type Phase = 'idle' | 'thinking' | 'speaking';

interface AvatarState {
  sessionId: string;
  currentAgent: ProductAgent;
  messages: ChatMessage[];
  phase: Phase;
  error: string | null;
  autoSpeak: boolean;
  muted: boolean;
  // ref-style state (non-serializable but fine for zustand)
  audioEl: HTMLAudioElement | null;

  setAgent: (id: AgentId) => void;
  toggleAutoSpeak: () => void;
  toggleMuted: () => void;
  setAudioEl: (el: HTMLAudioElement | null) => void;
  setPhase: (p: Phase) => void;
  setError: (e: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  replay: (messageId: string) => Promise<void>;
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
  return res.blob();
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  sessionId: typeof window !== 'undefined' ? makeSessionId() : 'ssr',
  currentAgent: AGENTS[0],
  messages: [],
  phase: 'idle',
  error: null,
  autoSpeak: true,
  muted: false,
  audioEl: null,

  setAgent: (id) => {
    const agent = AGENTS.find((a) => a.id === id) ?? AGENTS[0];
    set({ currentAgent: agent, phase: 'idle', error: null });
    // Stop any playing audio when switching agents
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  },

  toggleAutoSpeak: () => set((s) => ({ autoSpeak: !s.autoSpeak })),
  toggleMuted: () => {
    const muted = !get().muted;
    const el = get().audioEl;
    if (el) el.muted = muted;
    set({ muted });
  },
  setAudioEl: (el) => set({ audioEl: el }),
  setPhase: (p) => set({ phase: p }),
  setError: (e) => set({ error: e }),

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { sessionId, currentAgent: agent, autoSpeak, muted } = get();

    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      agentId: agent.id,
      createdAt: Date.now(),
    };
    const pendingAssistantId = makeId();
    const pendingMsg: ChatMessage = {
      id: pendingAssistantId,
      role: 'assistant',
      content: '',
      agentId: agent.id,
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
        body: JSON.stringify({ sessionId, agentId: agent.id, message: trimmed }),
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

  stopSpeaking: () => {
    const el = get().audioEl;
    if (el) {
      el.pause();
      el.currentTime = 0;
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
          return { ...m, audioUrl: url, pendingAudio: false };
        }
        return m;
      }),
    }));

    const el = get().audioEl;
    if (!el) {
      set({ phase: 'idle' });
      return;
    }
    el.src = url;
    el.muted = get().muted;
    el.onended = () => {
      if (get().phase === 'speaking') set({ phase: 'idle' });
    };
    el.onerror = () => {
      set({ phase: 'idle', error: 'Audio playback failed.' });
    };
    try {
      await el.play();
    } catch {
      // Autoplay may be blocked until the user interacts — fall back to idle
      set({ phase: 'idle' });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'TTS failed';
    set((s) => ({
      phase: 'idle',
      error: msg,
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, pendingAudio: false } : m
      ),
    }));
  }
}
