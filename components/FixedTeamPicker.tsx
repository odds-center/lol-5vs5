'use client';

import type { FixedTeam } from '@/types';
import { useTranslation } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';

/** '' = 자동 배치, 'A' = 1팀(블루) 고정, 'B' = 2팀(레드) 고정 */
const FIXED_TEAM_OPTIONS: FixedTeam[] = ['', 'A', 'B'];

interface FixedTeamPickerProps {
  /** 라디오 그룹 이름. 슬롯마다 달라야 함 */
  name: string;
  value: FixedTeam;
  onChange: (value: FixedTeam) => void;
  /** 해당 팀이 이미 꽉 차 더 고정할 수 없으면 true */
  isOptionDisabled?: (value: FixedTeam) => boolean;
}

/** 참가자 한 명의 팀 고정(자동 / 1팀 / 2팀). 셋 중 하나만 고를 수 있어 라디오 */
export default function FixedTeamPicker({
  name,
  value,
  onChange,
  isOptionDisabled,
}: FixedTeamPickerProps) {
  const { t } = useTranslation();
  const meta: Record<FixedTeam, { label: string; title: string; selected: string }> = {
    '': {
      label: t('fixedTeamAuto'),
      title: t('fixedTeamAutoTitle'),
      selected: 'bg-lol-card text-lol-gold-bright',
    },
    A: {
      label: t('team1'),
      title: t('team1Title'),
      selected: 'bg-lol-blue-border text-lol-gold-bright',
    },
    B: {
      label: t('team2'),
      title: t('team2Title'),
      selected: 'bg-lol-red-border text-lol-gold-bright',
    },
  };

  return (
    <div
      role='radiogroup'
      className='inline-flex overflow-hidden rounded-lg border border-lol-border bg-lol-bg-card'
    >
      {FIXED_TEAM_OPTIONS.map((option) => {
        const selected = value === option;
        const disabled = !selected && !!isOptionDisabled?.(option);
        return (
          <label
            key={option || 'auto'}
            title={disabled ? t('fixedTeamFull') : meta[option].title}
            className={cn(
              'lol-desc cursor-pointer select-none border-r border-lol-border px-2.5 py-1.5 text-center transition-colors last:border-r-0',
              selected
                ? meta[option].selected
                : 'text-lol-muted hover:bg-lol-card/50 hover:text-lol-gold-bright',
              disabled && 'cursor-not-allowed text-lol-muted/40 hover:bg-transparent hover:text-lol-muted/40',
            )}
          >
            <input
              type='radio'
              name={name}
              value={option}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(option)}
              className='sr-only'
            />
            {meta[option].label}
          </label>
        );
      })}
    </div>
  );
}
