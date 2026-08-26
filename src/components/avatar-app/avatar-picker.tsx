'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { AVATARS, type AvatarId } from '@/lib/avatars';
import { useAvatarStore } from '@/lib/store';

/**
 * AvatarPicker — horizontal scroll of photorealistic AI faces.
 * Decoupled from product agent: pick any face + any voice/product persona.
 */
export function AvatarPicker() {
  const current = useAvatarStore((s) => s.currentAvatar);
  const setAvatar = useAvatarStore((s) => s.setAvatar);

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Choose an avatar face"
        className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {AVATARS.map((avatar) => {
          const isActive = avatar.id === current.id;
          return (
            <button
              key={avatar.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setAvatar(avatar.id as AvatarId)}
              className={`group relative flex shrink-0 flex-col items-center gap-1 rounded-xl border p-1.5 transition-all ${
                isActive
                  ? 'border-foreground shadow-sm'
                  : 'border-border bg-background hover:bg-muted/60'
              }`}
              aria-label={`${avatar.name}, ${avatar.vibe}`}
            >
              <div className="relative h-14 w-12 overflow-hidden rounded-md">
                <Image
                  src={avatar.image}
                  alt={`${avatar.name} portrait`}
                  fill
                  sizes="3rem"
                  className={`object-cover transition-all ${
                    isActive ? 'saturate-100' : 'saturate-50 group-hover:saturate-100'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="avatar-active-check"
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md rounded-tr-md bg-foreground text-background"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                )}
              </div>
              <span className="text-[11px] font-medium leading-tight">
                {avatar.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
