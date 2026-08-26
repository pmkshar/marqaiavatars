'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX, Mic2, Square } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAvatarStore } from '@/lib/store';
import { AgentIcon } from './agent-icon';
import { TalkingAvatar } from './talking-avatar';

/**
 * AvatarStage — the left-column showcase.
 * Combines:
 *   - TalkingAvatar (the photorealistic portrait with face animations)
 *   - Identity card (avatar name + agent role + product)
 *   - Voice controls (auto-voice, mute, stop)
 *   - Hidden <audio> element driven by the store
 */
export function AvatarStage() {
  const avatar = useAvatarStore((s) => s.currentAvatar);
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

  return (
    <div
      className="avatar-bg relative flex flex-col items-center gap-5 rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm sm:p-6"
      style={
        { ['--avatar-accent' as string]: agent.accent } as React.CSSProperties
      }
    >
      <TalkingAvatar />

      {/* Identity card */}
      <div className="flex w-full flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: agent.accent }}
            aria-hidden
          >
            <AgentIcon name={agent.icon} className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight">{avatar.name}</h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{agent.role}</p>
        <div
          className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: agent.accentSoft, color: agent.accent }}
        >
          {agent.product}
        </div>
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
          {agent.tagline}
        </p>
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
