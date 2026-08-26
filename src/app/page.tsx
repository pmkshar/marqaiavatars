'use client';

import { Sparkles } from 'lucide-react';
import { AvatarStage } from '@/components/avatar-app/avatar-stage';
import { AvatarPicker } from '@/components/avatar-app/avatar-picker';
import { ChatPanel } from '@/components/avatar-app/chat-panel';
import { ThemeToggle } from '@/components/avatar-app/theme-toggle';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-orange-500 to-amber-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                Polymath Avatar
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Pick a face, pick a voice — they speak like a real human
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground sm:inline-flex">
              4 AI faces · 5 product voices
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-stretch">
        <section
          aria-label="Avatar"
          className="lg:sticky lg:top-[4.5rem] lg:w-[24rem] lg:self-start"
        >
          <AvatarStage />
          {/* Avatar face picker — below the talking stage */}
          <div className="mt-3 rounded-2xl border border-border/70 bg-card/40 p-2.5 backdrop-blur-sm">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Pick a face
            </p>
            <AvatarPicker />
          </div>
        </section>
        <section
          aria-label="Conversation"
          className="flex min-h-[32rem] flex-1 flex-col lg:min-h-0 lg:h-[calc(100vh-6.5rem)]"
        >
          <ChatPanel />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            Built with Next.js 16 · Tailwind · Z.ai SDK (LLM + TTS + image-gen)
          </p>
          <p className="text-center sm:text-right">
            4 photorealistic AI faces with breathing, blinking &amp; lip-sync motion.
          </p>
        </div>
      </footer>
    </div>
  );
}
