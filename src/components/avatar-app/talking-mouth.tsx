'use client';

import { useEffect, useState } from 'react';
import { useAvatarStore } from '@/lib/store';

/**
 * TalkingMouth (Option A) — the mouth opening size is driven by the
 * REAL audio amplitude of the TTS playback, sampled ~30 times per second
 * via the Web Audio API analyser set up in the store.
 *
 * How it works:
 *   1. The store sets up an AnalyserNode connected to the <audio> element.
 *   2. On every animation frame, the store reads the RMS amplitude of
 *      the audio (0..1) and dispatches it to our registered callback.
 *   3. We store the latest amplitude in a ref + state and use it to drive
 *      the mouth interior's width/height.
 *   4. When amplitude is 0 (silent), the mouth rests in a slight smile.
 *   5. We also pick a "viseme flavor" every ~120ms (rounded, wide, narrow)
 *      to add variation on TOP of the amplitude, so the mouth doesn't just
 *      open/close but also changes shape like real speech.
 *
 * The mouth interior is a dark ellipse that morphs; teeth appear when
 * the mouth opens; a tongue shows on wide openings; a lip highlight
 * tints with the active agent's accent.
 */

interface Props {
  speaking: boolean;
  accent: string;
  topPct?: number;
  widthPct?: number;
}

type Flavor = 'neutral' | 'rounded' | 'wide' | 'narrow';

const FLAVORS: Flavor[] = ['neutral', 'rounded', 'wide', 'narrow'];

interface MouthShape {
  /** base width % of container when mouth is closed */
  w: number;
  /** base height % of container when mouth is closed */
  h: number;
  /** multiplier on width when amplitude = 1 */
  wAmp: number;
  /** multiplier on height when amplitude = 1 */
  hAmp: number;
}

const SHAPES: Record<Flavor, MouthShape> = {
  neutral: { w: 36, h: 5, wAmp: 1.05, hAmp: 5.5 },
  rounded: { w: 30, h: 6, wAmp: 0.95, hAmp: 5.0 },
  wide: { w: 42, h: 4, wAmp: 1.0, hAmp: 6.0 },
  narrow: { w: 26, h: 7, wAmp: 1.1, hAmp: 4.0 },
};

export function TalkingMouth({
  speaking,
  accent,
  topPct = 70,
  widthPct = 22,
}: Props) {
  const [amplitude, setAmplitude] = useState(0);
  const [flavor, setFlavor] = useState<Flavor>('neutral');
  const setAmplitudeCallback = useAvatarStore((s) => s.setAmplitudeCallback);

  // Register our amplitude callback. The store will call it ~30x/sec
  // with the current RMS amplitude (0..1) while the avatar is speaking.
  useEffect(() => {
    setAmplitudeCallback((amp: number) => {
      setAmplitude(amp);
    });
    return () => setAmplitudeCallback(null);
  }, [setAmplitudeCallback]);

  // While speaking, change the "flavor" of the mouth shape every ~120ms
  // to add variation on top of the amplitude signal. This makes the mouth
  // look like it's forming different vowel shapes, not just opening/closing.
  useEffect(() => {
    if (!speaking) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      setFlavor(FLAVORS[Math.floor(Math.random() * FLAVORS.length)]);
      timeoutId = setTimeout(tick, 100 + Math.random() * 80);
    };
    tick();
    return () => clearTimeout(timeoutId);
  }, [speaking]);

  // Compute the actual mouth dimensions from amplitude + shape.
  // When speaking=false, amplitude is 0 so the mouth rests in a slight smile.
  // We also reset the flavor to 'neutral' when not speaking (derived, no setState).
  const activeFlavor = speaking ? flavor : 'neutral';
  const activeShape = SHAPES[activeFlavor];
  const amp = speaking ? amplitude : 0;
  const mouthW = activeShape.w * (1 + (activeShape.wAmp - 1) * amp);
  const mouthH = activeShape.h * (1 + (activeShape.hAmp - 1) * amp);

  // Teeth visibility — appears when mouth opens past ~25% amplitude
  const teethOpacity = Math.max(0, Math.min((amp - 0.15) * 1.4, 0.9));
  // Tongue visibility — only on wide openings (>60% amp)
  const tongueOpacity = Math.max(0, Math.min((amp - 0.55) * 2, 0.5));
  // Lip highlight intensifies with amplitude
  const lipHighlight = speaking ? 0.4 + amp * 0.4 : 0.25;

  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        top: `${topPct}%`,
        width: `${widthPct}%`,
        aspectRatio: '2 / 1',
      }}
      aria-hidden
    >
      {/* Mouth interior — dark ellipse that morphs with audio amplitude */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: `${mouthW * 0.9}%`,
          height: `${Math.max(mouthH, 2)}%`,
          background: `radial-gradient(ellipse at 50% 30%, #1a0606 0%, #0a0202 100%)`,
          boxShadow: `inset 0 ${Math.min(mouthH, 8) * 0.4}px 4px rgba(0,0,0,0.6), inset 0 -${Math.min(mouthH, 8) * 0.3}px 3px ${accent}33`,
          transition: 'width 60ms linear, height 60ms linear',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Upper teeth — visible when mouth opens */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-[40%_40%_50%_50%/60%_60%_50%_50%]"
        style={{
          width: `${Math.max(mouthW * 0.8, 0)}%`,
          height: `${Math.max(Math.min(mouthH * 0.22, 4), 0)}px`,
          opacity: teethOpacity,
          background: 'linear-gradient(to bottom, #fafafa 0%, #e8e8e0 60%, #d4d4c8 100%)',
          transform: `translate(-50%, calc(-50% - ${Math.min(mouthH * 0.45, 10)}px))`,
          transition: 'opacity 80ms ease, width 60ms linear, transform 60ms linear',
        }}
      />

      {/* Lower teeth — barely visible, gives depth */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-[50%_50%_40%_40%/50%_50%_60%_60%]"
        style={{
          width: `${Math.max(mouthW * 0.7, 0)}%`,
          height: `${Math.max(Math.min(mouthH * 0.15, 3), 0)}px`,
          opacity: teethOpacity * 0.6,
          background: 'linear-gradient(to top, #fafafa 0%, #e8e8e0 60%, #d4d4c8 100%)',
          transform: `translate(-50%, calc(-50% + ${Math.min(mouthH * 0.4, 8)}px))`,
          transition: 'opacity 80ms ease, width 60ms linear, transform 60ms linear',
        }}
      />

      {/* Tongue — appears when mouth is wide open */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-[50%_50%_50%_50%/40%_40%_60%_60%]"
        style={{
          width: `${Math.max(mouthW * 0.6, 0)}%`,
          height: `${Math.max(Math.min(mouthH * 0.4, 6), 0)}px`,
          opacity: tongueOpacity,
          background: 'linear-gradient(to bottom, #b8566a 0%, #913d50 100%)',
          transform: `translate(-50%, calc(-50% + ${Math.min(mouthH * 0.15, 4)}px))`,
          transition: 'opacity 80ms ease, width 60ms linear, transform 60ms linear',
        }}
      />

      {/* Lip highlight — thin line on the lower lip, intensifies with speech */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: `${mouthW + 4}%`,
          height: `${Math.max(mouthH * 0.18, 2)}px`,
          opacity: lipHighlight,
          background: `linear-gradient(to bottom, ${accent}aa, transparent)`,
          transform: `translate(-50%, calc(-50% + ${Math.min(mouthH * 0.7, 14) + 2}px))`,
          transition: 'opacity 80ms ease, width 60ms linear, transform 60ms linear',
          mixBlendMode: 'soft-light',
        }}
      />
    </div>
  );
}
