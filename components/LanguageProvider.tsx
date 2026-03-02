'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  type Locale,
  type TranslationKey,
  getTranslation,
  getStoredLocale,
  setStoredLocale,
  getRoleLabels,
} from '@/lib/i18n';
import type { Role } from '@/types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey) => string;
  roleLabels: Record<Role, string>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'ko' ? 'ko' : 'en';
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setStoredLocale(next);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      setLocale,
      t: (key: TranslationKey) => getTranslation(locale, key),
      roleLabels: getRoleLabels(locale),
    };
  }, [locale, setLocale]);

  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          locale: 'ko',
          setLocale: () => {},
          t: (key: TranslationKey) => getTranslation('ko', key),
          roleLabels: getRoleLabels('ko'),
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}
