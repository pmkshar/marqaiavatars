'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * Renders a theme toggle that avoids hydration mismatch by rendering a
 * static placeholder until after mount. The `mounted` pattern is the
 * canonical next-themes approach; we silence the React 19 lint rule
 * because the setState genuinely needs to run on mount.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
