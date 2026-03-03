'use client';

import Image from 'next/image';
import { CHAMPION_NAMES } from '@/lib/randomNames';
import { useTranslation } from '@/components/LanguageProvider';

interface ChampionPickerModalProps {
  isOpen: boolean;
  onSelect: (championName: string) => void;
  onClose: () => void;
}

/**
 * 챔피언 선택 모달. 그리드에서 클릭 시 해당 챔피언 이름 반환.
 */
export default function ChampionPickerModal({ isOpen, onSelect, onClose }: ChampionPickerModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('championSelect')}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg border border-lol-border bg-lol-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-lol-border bg-lol-bg-card/80 px-4 py-3">
          <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-lol-gold">
            {t('championSelect')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-lol-muted transition-colors hover:bg-lol-border hover:text-lol-gold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="flex flex-wrap justify-center gap-1.5">
            {CHAMPION_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelect(name);
                  onClose();
                }}
                className="series-ban-cell relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-lol-border bg-lol-bg-card transition-colors hover:border-lol-gold/60 hover:bg-lol-card sm:h-11 sm:w-11"
                title={name}
              >
                <Image
                  src={`/champion/${encodeURIComponent(name)}.webp`}
                  alt=""
                  width={44}
                  height={44}
                  className="relative z-10 h-full w-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="series-ban-fallback absolute inset-0 z-0 flex items-center justify-center bg-lol-bg-card/90 text-[10px] font-medium text-lol-gold-bright">
                  {name.length > 2 ? name.slice(0, 2) : name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute inset-0 -z-10"
        aria-label="배경 클릭하여 닫기"
        onClick={onClose}
      />
    </div>
  );
}
