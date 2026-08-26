'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX, Mic2, Square } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { AVATAR_PROFILE } from '@/lib/avatar-profile';
import { useAvatarStore } from '@/lib/store';
import { AgentIcon } from './agent-icon';

export function AvatarStage() {
  const agent = useAvatarStore((s) => s.currentAgent);
  const phase = useAvatarStore((s) => s.phase);
  const muted = useAvatarStore((s) => s.muted);
  const autoSpeak = useAvatarStore((s) => s.autoSpeak);
  const toggleMuted = useAvatarStore((s) => s.toggleMuted);
  const toggleAutoSpeak = useAvatarStore((s) => s.toggleAutoSpeak);
  const stopSpeaking = useAvatarStore((s) => s.stopSpeaking);
  const setAudioEl = useAvatarStore((s) => s.setAudioEl);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setAudioEl(audioRef.current);
  }, [setAudioEl]);

  const speaking = phase === 'speaking';
  const thinking = phase === 'thinking';

  return (
    <div
      className="avatar-bg relative flex flex-col items-center gap-6 rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm sm:p-8"
      style={
        { ['--avatar-accent' as string]: agent.accent } as React.CSSProperties
      }
    >
      {/* Avatar visual */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-44 w-44 sm:h-52 sm:w-52">
          {/* Pulsing halo while speaking */}
          {speaking && (
            <div
              className="avatar-pulse absolute inset-0 rounded-full"
              style={
                {
                  ['--avatar-glow' as string]: agent.accent,
                } as React.CSSProperties
              }
              aria-hidden
            />
          )}

          {/* Spinning gradient ring */}
          <motion.div
            className="absolute -inset-1 rounded-full opacity-90 blur-[6px]"
            style={{ backgroundImage: `linear-gradient(135deg, ${agent.accent}, transparent 70%)` }}
            animate={{ rotate: speaking ? 360 : 0 }}
            transition={{
              duration: speaking ? 6 : 0,
              ease: 'linear',
              repeat: speaking ? Infinity : 0,
            }}
            aria-hidden
          />

          {/* Avatar photo */}
          <motion.div
            className={`relative h-44 w-44 overflow-hidden rounded-full border-4 border-background shadow-xl sm:h-52 sm:w-52 ${speaking ? '' : 'avatar-float'}`}
            animate={
              speaking
                ? { scale: [1, 1.02, 1] }
                : { scale: 1 }
            }
            transition={
              speaking
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          >
            <Image
              src={AVATAR_PROFILE.image}
              alt={`${agent.name} \u2014 ${agent.role}`}
              fill
              sizes="(max-width: 640px) 11rem, 13rem"
              priority
              className="object-cover"
            />
            {/* Subtle gradient wash that tints the avatar with the agent's accent */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              style={{
                background: `linear-gradient(140deg, ${agent.accent}55, transparent 60%)`,
              }}
              aria-hidden
            />
          </motion.div>

          {/* Status pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-medium shadow-sm">
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
      </div>

      {/* Identity card */}
      <div className="flex w-full flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: agent.accent }}
            aria-hidden
          >
            <AgentIcon name={agent.icon} className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight">{agent.name}</h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{agent.role}</p>
        <div
          className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: agent.accentSoft, color: agent.accent }}
        >
          {agent.product}
        </div>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{agent.tagline}</p>
      </div>

      {/* Voice controls */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <ControlButton
          active={autoSpeak}
          onClick={toggleAutoSpeak}
          icon={<Mic2 className="h-4 w-4" />}
          label={autoSpeak ? 'Auto-voice on' : 'Auto-voice off'}
        />
        <ControlButton
          active={!muted}
          onClick={toggleMuted}
          icon={muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          label={muted ? 'Muted' : 'Sound on'}
        />
        {speaking && (
          <ControlButton
            active
            onClick={stopSpeaking}
            icon={<Square className="h-4 w-4" />}
            label="Stop"
            tone="danger"
          />
        )}
      </div>

      {/* Hidden audio element driven by the store */}
      <audio ref={audioRef} className="hidden" preload="auto" />
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
  tone = 'default',
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        tone === 'danger'
          ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
          : active
            ? 'border-border bg-foreground text-background'
            : 'border-border bg-background text-muted-foreground hover:bg-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
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
