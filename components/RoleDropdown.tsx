'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RolePreference } from '@/types';
import { ROLES, ROLE_LABELS, type Role } from '@/types';
import RoleIcon from './RoleIcon';

const ROLE_OPTIONS: RolePreference[] = ['', ...ROLES];

interface RoleDropdownProps {
  value: RolePreference;
  onChange: (value: RolePreference) => void;
  isOptionDisabled?: (role: Role) => boolean;
  placeholder?: string;
}

export default function RoleDropdown({
  value,
  onChange,
  isOptionDisabled,
  placeholder = '미정',
}: RoleDropdownProps) {
  const LIST_GAP = 4;
  /** 목록 전체가 보이도록 여유 높이 (역할 6개 기준) */
  const LIST_MAX_HEIGHT = 280;

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
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const label = value !== '' ? ROLE_LABELS[value as Role] : placeholder;
  const disabled = (r: Role) => (isOptionDisabled ? isOptionDisabled(r) : false);

  const dropdownList = open && position && typeof document !== 'undefined' && (
    <ul
      ref={listRef}
      className='scrollbar-hide fixed z-[100] min-w-[7.5rem] rounded border border-lol-border bg-lol-card py-1 shadow-lg'
      role='listbox'
      style={{
        ...(position.top !== undefined ? { top: position.top } : { bottom: position.bottom }),
        left: position.left,
        width: `max(${position.width}px, 7.5rem)`,
      }}
    >
      {ROLE_OPTIONS.map((r) => {
        const isRole = r !== '';
        const isDisabled = isRole && disabled(r as Role);
        const isSelected = value === r;
        return (
          <li key={r || 'none'} role='option' aria-selected={isSelected}>
            <button
              type='button'
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onChange(r);
                  setOpen(false);
                }
              }}
              className={`flex w-full min-w-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors ${
                isDisabled
                  ? 'cursor-not-allowed text-lol-muted opacity-60'
                  : 'cursor-pointer text-lol-gold-bright hover:bg-lol-bg-card'
              } ${isSelected ? 'bg-lol-bg-card/80' : ''}`}
            >
              <span className='inline-flex h-4 w-4 shrink-0 items-center justify-center'>
                {isRole ? <RoleIcon role={r as Role} size={16} /> : null}
              </span>
              <span className='min-w-0 flex-1'>{r === '' ? placeholder : ROLE_LABELS[r as Role]}</span>
              {isDisabled && <span className='lol-desc shrink-0 text-lol-muted'>(마감)</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div ref={triggerRef} className='relative inline-block min-w-[6.5rem]'>
        <button
          type='button'
          onClick={() => setOpen((o) => !o)}
          className='flex w-full min-w-0 items-center gap-1.5 rounded border border-lol-border bg-lol-bg-card px-2 py-1.5 text-base text-lol-gold-bright transition-colors hover:border-lol-border-light hover:bg-lol-card focus:outline-none focus:ring-1 focus:ring-lol-gold'
          aria-haspopup='listbox'
          aria-expanded={open}
        >
          <span className='inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center'>
            {value !== '' ? <RoleIcon role={value as Role} size={18} /> : null}
          </span>
          <span className='min-w-0 flex-1 whitespace-nowrap text-left'>{label}</span>
          <span className='shrink-0 text-lol-muted' aria-hidden>
            {open ? '▲' : '▼'}
          </span>
        </button>
      </div>
      {dropdownList && createPortal(dropdownList, document.body)}
    </>
  );
}
