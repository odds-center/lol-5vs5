'use client';

import { useTranslation } from '@/components/LanguageProvider';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="absolute right-4 top-4 z-20 flex rounded-lg border border-lol-border bg-lol-bg-card/90 text-sm shadow-md">
      {(['ko', 'en'] as Locale[]).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={cn(
            'cursor-pointer min-w-[3rem] px-3 py-2 font-medium uppercase transition-colors touch-manipulation',
            locale === loc
              ? 'bg-lol-gold/20 text-lol-gold'
              : 'text-lol-muted hover:bg-lol-card/50 hover:text-lol-gold-bright',
          )}
          aria-pressed={locale === loc}
        >
          {loc === 'ko' ? 'KO' : 'EN'}
        </button>
      ))}
    </div>
  );
}
