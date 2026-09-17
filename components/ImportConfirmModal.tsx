'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/components/LanguageProvider';
import { buttonPrimaryClass, buttonSecondaryClass } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ImportConfirmModalProps {
  names: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

/** 디스코드 링크로 들어온 참가자 명단을 덮어쓰기 전 확인받는 모달 */
export default function ImportConfirmModal({ names, onConfirm, onCancel }: ImportConfirmModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'
      onClick={onCancel}
      role='presentation'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='import-confirm-title'
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-md rounded-xl border border-t-[3px] border-lol-border border-t-lol-gold bg-gradient-to-b from-lol-bg-card to-lol-card p-5 shadow-panel'
      >
        <h2
          id='import-confirm-title'
          className='font-cinzel text-lg font-bold uppercase tracking-[0.15em] text-lol-gold'
        >
          {t('importTitle')}
        </h2>
        <p className='mt-3 text-sm leading-relaxed text-lol-muted'>
          {t('importConfirm').replace('{n}', String(names.length))}
        </p>
        <ol className='mt-4 max-h-56 overflow-y-auto rounded-lg border border-lol-border bg-lol-bg-card/70 p-3 text-sm text-lol-gold-bright'>
          {names.map((name, i) => (
            <li key={`${name}-${i}`} className='flex gap-2 py-0.5'>
              <span className='w-5 shrink-0 text-right text-lol-muted'>{i + 1}</span>
              <span className='truncate'>{name}</span>
            </li>
          ))}
        </ol>
        <div className='mt-5 flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className={cn(buttonSecondaryClass, 'rounded-lg')}
          >
            {t('importCancel')}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            autoFocus
            className={cn(buttonPrimaryClass, 'rounded-lg')}
          >
            {t('importApply')}
          </button>
        </div>
      </div>
    </div>
  );
}
