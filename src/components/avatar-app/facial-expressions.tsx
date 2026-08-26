'use client';

import { useEffect, useState } from 'react';

/**
 * FacialExpressions — overlays that add micro-expressions on top of the
 * portrait while speaking / thinking. These are subtle and layered on top
 * of (or under) the TalkingMouth overlay.
 *
 *   ┌─────────────────────────────┐
 *   │   eyebrow raise (occasional) │  ← thin translateY overlay
 *   │   ┌─┐ eye glints             │
 *   │   eyes ─────────             │
 *   │   ┌─ cheek blush ─┐          │  ← warm radial fade
 *   │   nose            │          │
 *   │   mouth (TalkingMouth)       │
 *   │   ┌─ jaw shadow ─┐           │  ← subtle darkening under chin
 *   └─────────────────────────────┘
 *
 * Each expression has its own randomized timer so they don't sync up.
 */
interface Props {
  speaking: boolean;
  thinking: boolean;
  accent: string;
}

export function FacialExpressions({ speaking, thinking, accent }: Props) {
  const [eyebrowRaise, setEyebrowRaise] = useState(0);
  const [blushOpacity, setBlushOpacity] = useState(0);
  const [eyeGlint, setEyeGlint] = useState(0);

  useEffect(() => {
    if (!speaking) return;

    let browT: ReturnType<typeof setTimeout>;
    let blushT: ReturnType<typeof setTimeout>;
    let glintT: ReturnType<typeof setTimeout>;

    const browLoop = () => {
      setEyebrowRaise(Math.random() < 0.55 ? Math.random() * 3 + 1.5 : 0);
      browT = setTimeout(browLoop, 600 + Math.random() * 900);
    };
    const blushLoop = () => {
      setBlushOpacity(Math.random() < 0.4 ? Math.random() * 0.4 + 0.2 : 0);
      blushT = setTimeout(blushLoop, 1200 + Math.random() * 1500);
    };
    const glintLoop = () => {
      setEyeGlint(Math.random() < 0.3 ? 0.5 + Math.random() * 0.4 : 0);
      glintT = setTimeout(glintLoop, 800 + Math.random() * 1200);
    };

    browLoop();
    blushLoop();
    glintLoop();

    return () => {
      clearTimeout(browT);
      clearTimeout(blushT);
      clearTimeout(glintT);
    };
  }, [speaking]);

  // Derive final values directly from phase — no extra setState needed.
  // While thinking, the brow holds a slight raise; otherwise use the
  // animated value (or zero when idle).
  const effectiveBrow = thinking ? 2.5 : speaking ? eyebrowRaise : 0;
  const effectiveBlush = speaking ? blushOpacity : 0;
  const effectiveGlint = speaking ? eyeGlint : 0;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Eyebrow raise overlay — a soft skin-tone gradient that lifts up,
          creating the illusion of the brow muscles contracting */}
      <div
        className="absolute inset-x-[18%] top-[24%] h-[8%] rounded-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18), transparent 70%)',
          opacity: Math.min(effectiveBrow / 4, 1) * 0.6,
          transform: `translateY(-${effectiveBrow}px)`,
          transition: 'transform 250ms ease, opacity 250ms ease',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Cheek blush — warm radial fade on both cheeks, fades in when "enthused" */}
      <div
        className="absolute left-[16%] top-[52%] h-[14%] w-[20%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}cc, transparent 70%)`,
          opacity: effectiveBlush,
          transition: 'opacity 400ms ease',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute right-[16%] top-[52%] h-[14%] w-[20%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}cc, transparent 70%)`,
          opacity: effectiveBlush,
          transition: 'opacity 400ms ease',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Eye glints — small white highlights in the eyes when "animated" */}
      <div
        className="absolute left-[24%] top-[36%] h-[3%] w-[6%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), transparent 60%)',
          opacity: effectiveGlint,
          transition: 'opacity 200ms ease',
        }}
      />
      <div
        className="absolute right-[24%] top-[36%] h-[3%] w-[6%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), transparent 60%)',
          opacity: effectiveGlint,
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Jaw shadow — subtle darkening under the chin when mouth is wide open,
          gives the illusion of the jaw dropping */}
      {speaking && (
        <div
          className="absolute left-1/2 top-[78%] h-[8%] w-[42%] -translate-x-1/2 rounded-[50%]"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.25), transparent 70%)',
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </div>
  );
}
