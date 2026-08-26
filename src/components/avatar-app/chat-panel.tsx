'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAvatarStore } from '@/lib/store';
import { AgentPicker } from './agent-picker';
import { MessageBubble } from './message-bubble';

export function ChatPanel() {
  const agent = useAvatarStore((s) => s.currentAgent);
  const avatar = useAvatarStore((s) => s.currentAvatar);
  const language = useAvatarStore((s) => s.currentLanguage);
  const messages = useAvatarStore((s) => s.messages);
  const phase = useAvatarStore((s) => s.phase);
  const error = useAvatarStore((s) => s.error);
  const sendMessage = useAvatarStore((s) => s.sendMessage);
  const clearChat = useAvatarStore((s) => s.clearChat);
  const setError = useAvatarStore((s) => s.setError);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages / phase changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || phase === 'thinking' || phase === 'speaking') return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const busy = phase === 'thinking' || phase === 'speaking';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Agent picker */}
      <AgentPicker />

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="chat-scroll relative flex-1 overflow-y-auto rounded-2xl border border-border bg-background/60 p-4 backdrop-blur-sm"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          // `key` includes both avatar + agent so EmptyState resets
          // whenever either changes.
          <EmptyState
            key={`${avatar.id}-${agent.id}-${language.id}`}
            onPickStarter={(text) => setInput(text)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded px-1 text-amber-700/70 hover:bg-amber-100 hover:text-amber-700 dark:text-amber-300/70 dark:hover:bg-amber-900"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${avatar.name} about ${agent.product} (${language.native})…`}
          rows={1}
          className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          disabled={busy}
          aria-label="Message"
        />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear conversation"
            className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="mb-0.5 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: agent.accent }}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

function EmptyState({
  onPickStarter,
}: {
  onPickStarter: (text: string) => void;
}) {
  const agent = useAvatarStore((s) => s.currentAgent);
  const avatar = useAvatarStore((s) => s.currentAvatar);
  const [starterHidden, setStarterHidden] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
        style={{ backgroundColor: agent.accent }}
        aria-hidden
      >
        <span className="text-xl font-semibold tracking-tight">
          {avatar.name.charAt(0)}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {avatar.name} · {agent.role}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {agent.description}
        </p>
      </div>
      {!starterHidden && (
        <div className="mt-2 flex w-full max-w-md flex-col gap-2">
          {agent.starters.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                onPickStarter(q);
                setStarterHidden(true);
              }}
              className="rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/70"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
