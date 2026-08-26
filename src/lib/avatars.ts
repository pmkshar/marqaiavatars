/**
 * AI-generated avatar identities — each one is a distinct photorealistic
 * human portrait. They are intentionally decoupled from product agents:
 * a user can pick ANY face and ANY voice/product persona independently.
 *
 * All portraits were generated with the z-ai image-generation skill.
 */

export type AvatarId = 'mei' | 'lucas' | 'priya' | 'kai';

export interface AvatarIdentity {
  id: AvatarId;
  name: string;
  /** Path under /public */
  image: string;
  /** Short descriptor shown in the picker */
  vibe: string;
  /** Approximate age for narrative flavor */
  age: number;
  /** Tailwind gradient (used for halo when no agent is active) */
  fallbackGradient: string;
}

export const AVATARS: AvatarIdentity[] = [
  {
    id: 'mei',
    name: 'Mei',
    image: '/avatars/mei.png',
    vibe: 'Friendly · approachable',
    age: 28,
    fallbackGradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
  },
  {
    id: 'lucas',
    name: 'Lucas',
    image: '/avatars/lucas.png',
    vibe: 'Warm · confident',
    age: 38,
    fallbackGradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    id: 'priya',
    name: 'Priya',
    image: '/avatars/priya.png',
    vibe: 'Calm · composed',
    age: 34,
    fallbackGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'kai',
    name: 'Kai',
    image: '/avatars/kai.png',
    vibe: 'Energetic · modern',
    age: 25,
    fallbackGradient: 'from-sky-500 via-indigo-500 to-violet-500',
  },
];

export const DEFAULT_AVATAR_ID: AvatarId = 'mei';

export function getAvatar(id: AvatarId | string | undefined): AvatarIdentity {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
