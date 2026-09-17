'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/components/LanguageProvider';
import { PARTICIPANT_SLOTS } from '@/lib/importLink';
import { buttonPrimaryClass, buttonSecondaryClass } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ImportConfirmModalProps {
  names: string[];
  onConfirm: (names: string[]) => void;
  onCancel: () => void;
}

/**
 * 디스코드에서 받은 명단을 덮어쓰기 전 확인하는 모달.
 * 음성 채널 인원이 슬롯 수보다 많을 수 있으므로, 여기서 빼서 인원을 맞춘다.
 */
export default function ImportConfirmModal({ names, onConfirm, onCancel }: ImportConfirmModalProps) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string[]>(names);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const over = picked.length - PARTICIPANT_SLOTS;
  const canImport = picked.length > 0 && over <= 0;

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
        className='flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-t-[3px] border-lol-border border-t-lol-gold bg-gradient-to-b from-lol-bg-card to-lol-card p-5 shadow-panel'
      >
        <div className='flex items-baseline justify-between gap-3'>
          <h2
            id='import-confirm-title'
            className='font-cinzel text-lg font-bold uppercase tracking-[0.15em] text-lol-gold'
          >
            {t('importTitle')}
          </h2>
          <span
            className={cn(
              'shrink-0 rounded-md px-2 py-0.5 text-sm tabular-nums',
              over > 0 ? 'bg-red-500/15 text-red-300' : 'bg-lol-card/80 text-lol-muted',
            )}
          >
            {picked.length} / {PARTICIPANT_SLOTS}
          </span>
        </div>

        <p className='mt-3 text-sm leading-relaxed text-lol-muted'>
          {over > 0
            ? t('importTooMany').replace('{n}', String(over))
            : t('importConfirm').replace('{n}', String(picked.length))}
        </p>

        <ol className='mt-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-lol-border bg-lol-bg-card/70 p-2 text-sm text-lol-gold-bright'>
          {picked.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className='flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-lol-card/40'
            >
              <span
                className={cn(
                  'w-5 shrink-0 text-right tabular-nums',
                  i >= PARTICIPANT_SLOTS ? 'text-red-400' : 'text-lol-muted',
                )}
              >
                {i + 1}
              </span>
              <span className='min-w-0 flex-1 truncate'>{name}</span>
              <button
                type='button'
                onClick={() => setPicked((prev) => prev.filter((_, idx) => idx !== i))}
                title={t('importRemove')}
                aria-label={`${name} ${t('importRemove')}`}
                className='shrink-0 rounded px-2 py-0.5 text-lol-muted transition-colors hover:bg-red-500/20 hover:text-red-300'
              >
                ✕
              </button>
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
            onClick={() => onConfirm(picked)}
            disabled={!canImport}
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
