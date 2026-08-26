'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAvatarStore } from '@/lib/store';
import { AgentIcon } from './agent-icon';

/**
 * TalkingAvatar — renders a photorealistic portrait with layered CSS
 * overlays that simulate a living, speaking human:
 *
 *   ┌─────────────────────────────┐
 *   │  spinning gradient ring      │  ← Framer Motion
 *   │  ┌───────────────────────┐   │
 *   │  │  portrait (Image)      │   │  ← breathing + head sway
 *   │  │   ┌─ eye-blink overlay │  │  ← scaleY collapse every ~5s
 *   │  │   ├─ eye-blink delay   │  │  ← second blink, offset phase
 *   │  │   └─ mouth-overlay     │  │  ← pulses while speaking
 *   │  │   ┌─ face vignette      │  │  ← radial focus on face
 *   │  │   └─ face warmth        │  │  ← warm color wash from below
 *   │  └───────────────────────┘   │
 *   │  status pill (Ready/Think/  │
 *   │  Speaking + equalizer)      │
 *   └─────────────────────────────┘
 *
 * State machine:
 *   idle      → breathing + sway + slow aura + periodic blinks
 *   thinking  → head-tilt animation + think-aura
 *   speaking  → speak-body lean + mouth-overlay pulse + fast aura + blinks
 */
export function TalkingAvatar() {
  const avatar = useAvatarStore((s) => s.currentAvatar);
  const agent = useAvatarStore((s) => s.currentAgent);
  const phase = useAvatarStore((s) => s.phase);
  // messages.length increases every time a new speak session starts,
  // so we use it as a stable key to restart the mouth animation cleanly.
  const speakSessionKey = useAvatarStore((s) => s.messages.length);

  const speaking = phase === 'speaking';
  const thinking = phase === 'thinking';

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
      {/* Aura ring behind portrait — color & speed vary by phase */}
      <div
        className={`absolute inset-0 rounded-2xl ${
          speaking
            ? 'speak-aura'
            : thinking
              ? 'think-aura'
              : 'idle-aura'
        }`}
        style={{
          background: `radial-gradient(circle at 50% 45%, ${agent.accent}40 0%, transparent 65%)`,
        }}
        aria-hidden
      />

      {/* Spinning gradient ring while speaking */}
      {speaking && (
        <motion.div
          className="absolute -inset-1 rounded-2xl opacity-80 blur-[5px]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${agent.accent}, transparent 70%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
          aria-hidden
        />
      )}

      {/* The portrait — breathing + state-driven body animation */}
      <motion.div
        key={avatar.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`absolute inset-0 ${
          speaking
            ? 'avatar-speak-body'
            : thinking
              ? 'avatar-think'
              : 'avatar-sway avatar-breathe'
        }`}
      >
        <Image
          src={avatar.image}
          alt={`${avatar.name} — ${agent.role}`}
          fill
          sizes="(max-width: 640px) 90vw, 22rem"
          priority
          className="object-cover"
        />

        {/* Eye blink overlays — positioned over the upper third of the face */}
        <div
          className="eye-blink absolute left-[18%] right-[58%] top-[34%] h-[5%] rounded-full"
          aria-hidden
        />
        <div
          className="eye-blink delay absolute left-[58%] right-[18%] top-[34%] h-[5%] rounded-full"
          aria-hidden
        />

        {/* Mouth-area overlay — only animates while speaking */}
        {speaking && (
          <div
            key={`mouth-${speakSessionKey}`}
            className="mouth-overlay absolute left-[30%] right-[30%] top-[58%] h-[10%] rounded-full"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${agent.accent}80, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Face warmth — subtle bottom-up color wash */}
        <div className="face-warmth absolute inset-0" aria-hidden />

        {/* Vignette — radial focus on the face */}
        <div className="face-vignette absolute inset-0" aria-hidden />
      </motion.div>

      {/* Status pill — bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-medium shadow-md">
        {speaking ? (
          <span className="flex items-center gap-1.5" style={{ color: agent.accent }}>
            <EqualizerBars />
            Speaking
          </span>
        ) : thinking ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
            Thinking
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready
          </span>
        )}
      </div>
    </div>
  );
}

function EqualizerBars() {
  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden>
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </span>
  );
}
