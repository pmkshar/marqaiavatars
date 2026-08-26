'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { LANGUAGES, type LanguageId } from '@/lib/languages';
import { useAvatarStore } from '@/lib/store';

/**
 * LanguagePicker — horizontal chips for the 5 supported languages.
 * Picks the conversation language; affects both LLM responses and TTS.
 */
export function LanguagePicker() {
  const current = useAvatarStore((s) => s.currentLanguage);
  const setLanguage = useAvatarStore((s) => s.setLanguage);

  return (
    <div
      role="tablist"
      aria-label="Choose conversation language"
      className="flex flex-wrap gap-1.5"
    >
      {LANGUAGES.map((lang) => {
        const isActive = lang.id === current.id;
        return (
          <button
            key={lang.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => setLanguage(lang.id as LanguageId)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <span className="text-[13px] leading-none">{lang.flag}</span>
            <span>{lang.native}</span>
            {isActive && (
              <motion.span
                layoutId="lang-active"
                className="ml-0.5 flex h-3 w-3 items-center justify-center"
              >
                <Check className="h-3 w-3" />
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}
