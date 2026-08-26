'use client';

import { motion } from 'framer-motion';
import { RotateCw, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAgent } from '@/lib/agents';
import { type ChatMessage, useAvatarStore } from '@/lib/store';
import { AgentIcon } from './agent-icon';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const agent = getAgent(message.agentId);
  const phase = useAvatarStore((s) => s.phase);
  const replay = useAvatarStore((s) => s.replay);
  const muted = useAvatarStore((s) => s.muted);

  const isPending = isUser ? false : message.content === '';
  const isError = !isUser && message.content.startsWith('\u26a0\ufe0f');
  const isSpeakingThisMessage =
    phase === 'speaking' && !isUser && !isPending && !isError;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar / user pill */}
      {!isUser ? (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: agent.accent }}
          aria-hidden
        >
          <AgentIcon name={agent.icon} className="h-4 w-4" />
        </div>
      ) : (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <span className="text-xs font-semibold">You</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`flex max-w-[calc(100%-3rem)] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`prose-chat rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-foreground text-background'
              : isError
                ? 'rounded-tl-sm border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                : 'rounded-tl-sm border border-border bg-card text-card-foreground'
          }`}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
              <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
              <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
            </span>
          ) : isError ? (
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{message.content.replace(/^\u26a0\ufe0f\s*/, '')}</span>
            </span>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Footer row: agent name + actions */}
        {!isUser && !isPending && !isError && (
          <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
            <span className="font-medium" style={{ color: agent.accent }}>
              {agent.name} · {agent.role}
            </span>
            {message.pendingAudio && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <RotateCw className="h-3 w-3 animate-spin" />
                Generating voice…
              </span>
            )}
            {!message.pendingAudio && message.audioUrl && !muted && (
              <button
                type="button"
                onClick={() => replay(message.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-muted ${
                  isSpeakingThisMessage ? 'text-foreground' : ''
                }`}
                aria-label="Replay voice"
              >
                <RotateCw className="h-3 w-3" />
                Replay
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
