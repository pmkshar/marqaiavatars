'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  HeartHandshake,
  Cpu,
  Megaphone,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { AGENTS, type AgentId } from '@/lib/agents';
import { useAvatarStore } from '@/lib/store';

const ICONS: Record<AgentId, LucideIcon> = {
  sales: TrendingUp,
  success: HeartHandshake,
  tech: Cpu,
  marketing: Megaphone,
  demo: PlayCircle,
};

export function AgentPicker() {
  const current = useAvatarStore((s) => s.currentAgent);
  const setAgent = useAvatarStore((s) => s.setAgent);

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Choose a product voice agent"
        className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {AGENTS.map((agent) => {
          const isActive = agent.id === current.id;
          const Icon = ICONS[agent.id];
          return (
            <button
              key={agent.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setAgent(agent.id)}
              className={`group relative flex min-w-[7.5rem] flex-1 shrink-0 flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? 'border-transparent text-foreground shadow-sm'
                  : 'border-border bg-background hover:bg-muted/60'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: agent.accentSoft,
                      borderColor: agent.accent,
                      boxShadow: `0 0 0 1px ${agent.accent}40`,
                    }
                  : undefined
              }
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{ backgroundColor: agent.accent }}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
                {isActive && (
                  <motion.span
                    layoutId="agent-active-dot"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: agent.accent }}
                    aria-hidden
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold leading-tight">
                  {agent.role}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {agent.product}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
