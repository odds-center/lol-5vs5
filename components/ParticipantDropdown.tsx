'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Player } from '@/types';
import { useTranslation } from '@/components/LanguageProvider';

interface ParticipantDropdownProps {
  slots: Player[];
  value: string;
  onChange: (id: string) => void;
  /** 이 id는 선택 불가 (다른 드롭다운에서 선택된 참가자) */
  excludeId?: string;
  placeholder?: string;
}

export default function ParticipantDropdown({
  slots,
  value,
  onChange,
  excludeId = '',
  placeholder,
}: ParticipantDropdownProps) {
  const { t } = useTranslation();
  const place = placeholder ?? t('select');
  const LIST_GAP = 4;
  /** 목록 전체가 보이도록 여유 높이 (참가자 11명 기준) */
  const LIST_MAX_HEIGHT = 480;

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - LIST_GAP;
    const openUp = spaceBelow < LIST_MAX_HEIGHT;
    if (openUp) {
      setPosition({
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + LIST_GAP,
      });
    } else {
      setPosition({
        left: rect.left,
        width: rect.width,
        top: rect.bottom + LIST_GAP,
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const selectedSlot = slots.find((p) => p.id === value);
  const selectedIndex = slots.findIndex((p) => p.id === value);
  const label =
    value && selectedSlot
      ? `${t('participant')} ${selectedIndex + 1}${selectedSlot.name?.trim() ? ` (${selectedSlot.name.trim()})` : ''}`
      : place;

  const dropdownList =
    open &&
    position &&
    typeof document !== 'undefined' &&
    createPortal(
      <ul
        ref={listRef}
        className="scrollbar-hide fixed z-[100] min-w-[11rem] rounded border border-lol-border bg-lol-card py-1 shadow-lg"
        role="listbox"
        style={{
          ...(position.top !== undefined ? { top: position.top } : { bottom: position.bottom }),
          left: position.left,
          width: `max(${position.width}px, 11rem)`,
        }}
      >
        <li role="option" aria-selected={!value}>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={`flex w-full min-w-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors hover:bg-lol-bg-card ${
              !value ? 'bg-lol-bg-card/80 text-lol-gold' : 'text-lol-gold-bright'
            }`}
          >
            {place}
          </button>
        </li>
        {slots.map((p, i) => {
          const isExcluded = p.id === excludeId;
          const isSelected = value === p.id;
          const optionLabel = `${t('participant')} ${i + 1}${p.name?.trim() ? ` (${p.name.trim()})` : ''}`;
          return (
            <li key={p.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                disabled={isExcluded}
                onClick={() => {
                  if (!isExcluded) {
                    onChange(p.id);
                    setOpen(false);
                  }
                }}
                className={`flex w-full min-w-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors ${
                  isExcluded
                    ? 'cursor-not-allowed text-lol-muted opacity-50'
                    : 'cursor-pointer text-lol-gold-bright hover:bg-lol-bg-card'
                } ${isSelected ? 'bg-lol-bg-card/80' : ''}`}
              >
                <span className="lol-desc shrink-0 text-lol-muted">#{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{optionLabel}</span>
                {isExcluded && <span className="lol-desc shrink-0 text-lol-muted">{t('selected')}</span>}
              </button>
            </li>
          );
        })}
      </ul>,
      document.body,
    );

  return (
    <div ref={triggerRef} className="relative inline-block min-w-[11rem]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-0 items-center gap-1.5 rounded-lg border border-lol-border bg-lol-bg-card px-3 py-2 text-sm text-lol-gold-bright transition-colors hover:border-lol-border-light hover:bg-lol-card focus:outline-none focus:ring-1 focus:ring-lol-gold"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <span className="shrink-0 text-lol-muted" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {dropdownList}
    </div>
  );
}
