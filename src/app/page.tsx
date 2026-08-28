'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { AvatarStage } from '@/components/avatar-app/avatar-stage';
import { AvatarPicker } from '@/components/avatar-app/avatar-picker';
import { ChatPanel } from '@/components/avatar-app/chat-panel';
import { LanguagePicker } from '@/components/avatar-app/language-picker';
import { ThemeToggle } from '@/components/avatar-app/theme-toggle';
import { AboutMARQ } from '@/components/avatar-app/about-marq';
import { useAvatarStore } from '@/lib/store';

export default function Home() {
  const playIntroduction = useAvatarStore((s) => s.playIntroduction);

  // Play the default agent's introduction on first mount.
  useEffect(() => {
    const timer = setTimeout(() => {
      playIntroduction();
    }, 1500);
    return () => clearTimeout(timer);
  }, [playIntroduction]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/marq-logo.png"
              alt="MARQ AI Tech logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
              priority
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                MARQ AI Tech
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                AI Avatar Voice Agents · Pvt Ltd
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AboutMARQ />
            <a
              href="https://marqaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted sm:inline-flex"
            >
              marqaitech.com
            </a>
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
          <div className="mt-3 rounded-2xl border border-border/70 bg-card/40 p-2.5 backdrop-blur-sm">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Pick a face
            </p>
            <AvatarPicker />
          </div>
          <div className="mt-2 rounded-2xl border border-border/70 bg-card/40 p-2.5 backdrop-blur-sm">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Voice language
            </p>
            <LanguagePicker />
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
          <div className="flex items-center gap-2">
            <Image
              src="/marq-logo.png"
              alt="MARQ AI Tech"
              width={16}
              height={16}
              className="h-4 w-4 rounded object-cover"
            />
            <span>© {new Date().getFullYear()} MARQ AI Tech Pvt Ltd</span>
          </div>
          <p className="text-center sm:text-right">
            <a href="https://marqaitech.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              marqaitech.com
            </a>
            {' · '}
            Voice chat · Lip-sync · 5 Indian languages
          </p>
        </div>
      </footer>
    </div>
  );
}
