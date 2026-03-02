'use client';

import { useTranslation } from '@/components/LanguageProvider';
import type { Locale } from '@/lib/i18n';

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="absolute right-4 top-4 flex rounded-lg border border-lol-border bg-lol-bg-card/80 text-sm">
      {(['ko', 'en'] as Locale[]).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={`min-w-[2.5rem] px-2.5 py-1.5 font-medium uppercase transition-colors ${
            locale === loc
              ? 'bg-lol-gold/20 text-lol-gold'
              : 'text-lol-muted hover:bg-lol-card/50 hover:text-lol-gold-bright'
          }`}
          aria-pressed={locale === loc}
        >
          {loc === 'ko' ? 'KO' : 'EN'}
        </button>
      ))}
    </div>
  );
}
