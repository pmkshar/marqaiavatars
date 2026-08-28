'use client';

import {
  Building2,
  Users,
  Handshake,
  Eye,
  Layers,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import type { ProductAgent } from '@/lib/agents';

const ICONS: Record<ProductAgent['icon'], LucideIcon> = {
  'building-2': Building2,
  users: Users,
  handshake: Handshake,
  eye: Eye,
  layers: Layers,
  'message-square': MessageSquare,
};

export function AgentIcon({
  name,
  className,
}: {
  name: ProductAgent['icon'];
  className?: string;
}) {
  const Icon = ICONS[name] ?? Building2;
  return <Icon className={className} />;
}
