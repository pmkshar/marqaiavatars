'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAvatarStore } from '@/lib/store';
import { TalkingMouth } from './talking-mouth';
import { FacialExpressions } from './facial-expressions';

/**
 * TalkingAvatar — renders a photorealistic portrait with a real talking
 * mouth overlay and layered facial-expression overlays.
 *
 * Layout (top to bottom, percentages are of the portrait container):
 *   24% — eyebrows (FacialExpressions handles raise)
 *   34% — eyes + eye-blink overlays + eye glints
 *   55% — nose tip
 *   70% — mouth (TalkingMouth — viseme-morphing interior + teeth)
 *   52% — cheek blush (FacialExpressions)
 *   78% — jaw shadow (FacialExpressions)
 *
 * The portrait itself only has very subtle breathing — no fake leaning.
 */
export function TalkingAvatar() {
  const avatar = useAvatarStore((s) => s.currentAvatar);
  const agent = useAvatarStore((s) => s.currentAgent);
  const phase = useAvatarStore((s) => s.phase);
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
          className="absolute -inset-1 rounded-2xl opacity-70 blur-[5px]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${agent.accent}, transparent 70%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
          aria-hidden
        />
      )}

      {/* The portrait — only very subtle breathing (no fake leaning) */}
      <motion.div
        key={avatar.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="avatar-breathe absolute inset-0"
      >
        <Image
          src={avatar.image}
          alt={`${avatar.name} — ${agent.role}`}
          fill
          sizes="(max-width: 640px) 90vw, 22rem"
          priority
          className="object-cover"
        />

        {/* Eye blink overlays — quick scaleY collapse on the eye area */}
        <div
          className="eye-blink absolute left-[20%] right-[58%] top-[35%] h-[4%] rounded-full"
          aria-hidden
        />
        <div
          className="eye-blink delay absolute left-[58%] right-[20%] top-[35%] h-[4%] rounded-full"
          aria-hidden
        />

        {/* Facial expressions: eyebrow raises, cheek blush, eye glints, jaw shadow */}
        <FacialExpressions speaking={speaking} thinking={thinking} accent={agent.accent} />

        {/* The talking mouth — viseme-morphing interior with visible teeth */}
        <TalkingMouth
          key={`mouth-${speakSessionKey}-${avatar.id}`}
          speaking={speaking}
          accent={agent.accent}
          topPct={70}
          widthPct={22}
        />

        {/* Vignette — radial focus on the face */}
        <div className="face-vignette absolute inset-0" aria-hidden />

        {/* Subtle warm color wash */}
        <div className="face-warmth absolute inset-0" aria-hidden />
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
