'use client';

import {
  TrendingUp,
  HeartHandshake,
  Cpu,
  Megaphone,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import type { ProductAgent } from '@/lib/agents';

const ICONS: Record<ProductAgent['icon'], LucideIcon> = {
  'trending-up': TrendingUp,
  'heart-handshake': HeartHandshake,
  cpu: Cpu,
  megaphone: Megaphone,
  'play-circle': PlayCircle,
};

export function AgentIcon({
  name,
  className,
}: {
  name: ProductAgent['icon'];
  className?: string;
}) {
  const Icon = ICONS[name] ?? TrendingUp;
  return <Icon className={className} />;
}
