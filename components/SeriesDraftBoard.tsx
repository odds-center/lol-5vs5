'use client';

import { useState, useEffect } from 'react';
import type { FearlessMode, SeriesDraft, TeamKind } from '@/types';
import { FEARLESS_MODES, ROLES, type Role } from '@/types';
import { filterChampionsBySearch, CHAMPION_NAMES } from '@/lib/randomNames';
import { isChampionInRole } from '@/lib/championRoles';
import {
  SLOT_COUNT,
  allPickedChampions,
  emptyGame,
  ensureFive,
  fearlessLocks,
  usedInGame,
} from '@/lib/fearless';
import Image from 'next/image';
import { useTranslation } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';
import { preloadChampionImages } from '@/lib/preload';
import RoleIcon from './RoleIcon';

type SlotKind = 'ban' | 'pick';

/** 지금 채우고 있는 슬롯 위치 */
interface PickingFor {
  gameIndex: number;
  team: TeamKind;
  kind: SlotKind;
  slotIndex: number;
}

interface SeriesDraftBoardProps {
  games: SeriesDraft;
  fearlessMode: FearlessMode;
  onUpdate: (next: SeriesDraft) => void;
  onFearlessModeChange: (mode: FearlessMode) => void;
}

/** GameDraft에서 해당 팀·종류의 배열 키 */
function slotKey(team: TeamKind, kind: SlotKind) {
  if (team === 'blue') return kind === 'ban' ? ('blueBans' as const) : ('bluePicks' as const);
  return kind === 'ban' ? ('redBans' as const) : ('redPicks' as const);
}

/** 비는 첫 슬롯 인덱스 (0~4). 다 차 있으면 5 */
function firstEmptySlot(slots: string[]): number {
  const i = ensureFive(slots).findIndex((s) => !s.trim());
  return i < 0 ? SLOT_COUNT : i;
}

/**
 * 경기별 밴픽 기록판. 팀당 5밴 + 5픽.
 * 슬롯을 고르면 아래에 챔피언 목록이 인라인으로 열리고,
 * 피어리스 모드에 따라 이전 경기에서 픽된 챔피언이 잠긴다.
 */
export default function SeriesDraftBoard({
  games,
  fearlessMode,
  onUpdate,
  onFearlessModeChange,
}: SeriesDraftBoardProps) {
  const { t, roleLabels } = useTranslation();
  const [pickingFor, setPickingFor] = useState<PickingFor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);

  useEffect(() => {
    if (!pickingFor) setSearchQuery('');
  }, [pickingFor]);

  // 챔피언 선택 패널이 열리면 현재 목록 이미지 미리 로드
  useEffect(() => {
    if (!pickingFor) return;
    let list = filterChampionsBySearch(searchQuery);
    if (roleFilter) list = list.filter(({ name }) => isChampionInRole(name, roleFilter));
    preloadChampionImages(list.map(({ name }) => name), 60);
  }, [pickingFor, searchQuery, roleFilter]);

  const setSlot = (at: PickingFor, name: string) => {
    const game = games[at.gameIndex];
    if (!game) return;
    const key = slotKey(at.team, at.kind);
    const current = ensureFive(game[key]);
    // 같은 경기 안에서는 밴·픽 통틀어 중복 불가 (지금 고치는 슬롯 자신은 제외)
    const taken = usedInGame(game);
    taken.delete(current[at.slotIndex]);
    if (taken.has(name)) return;
    // 피어리스 잠금은 픽에만 적용
    if (at.kind === 'pick' && fearlessLocks(games, at.gameIndex, fearlessMode, at.team).has(name)) {
      return;
    }
    const nextSlots = [...current];
    nextSlots[at.slotIndex] = name;
    onUpdate(games.map((g, i) => (i === at.gameIndex ? { ...g, [key]: nextSlots } : g)));
  };

  const clearSlot = (gameIndex: number, team: TeamKind, kind: SlotKind, slotIndex: number) => {
    const key = slotKey(team, kind);
    onUpdate(
      games.map((g, i) => {
        if (i !== gameIndex) return g;
        const nextSlots = ensureFive(g[key]);
        nextSlots[slotIndex] = '';
        return { ...g, [key]: nextSlots };
      }),
    );
  };

  const addGame = () => onUpdate([...games, emptyGame()]);

  /** 해당 경기의 밴·픽 전부 비우기 */
  const resetGame = (gameIndex: number) => {
    onUpdate(games.map((g, i) => (i === gameIndex ? emptyGame() : g)));
    setPickingFor(null);
  };

  const handleSelect = (name: string) => {
    if (!pickingFor) return;
    setSlot(pickingFor, name);
    // 클릭한 순서대로 다음 슬롯으로 이동 (5개 채우면 종료)
    if (pickingFor.slotIndex + 1 < SLOT_COUNT) {
      setPickingFor({ ...pickingFor, slotIndex: pickingFor.slotIndex + 1 });
    } else {
      setPickingFor(null);
    }
  };

  const usedCount = allPickedChampions(games).size;

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-1' role='group' aria-label={t('filterByRole')}>
          {(ROLES as Role[]).map((role) => (
            <button
              key={role}
              type='button'
              onClick={() => setRoleFilter((prev) => (prev === role ? null : role))}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 sm:h-10 sm:w-10',
                roleFilter === role
                  ? 'border-lol-gold bg-lol-gold/20 ring-1 ring-lol-gold/50'
                  : 'border-lol-border bg-lol-bg-card hover:border-lol-gold/50 hover:bg-lol-card/80',
              )}
              title={roleLabels[role]}
              aria-pressed={roleFilter === role}
            >
              <RoleIcon role={role} size={20} className='opacity-90' />
            </button>
          ))}
        </div>
        <h3 className='font-cinzel text-sm font-bold uppercase tracking-[0.25em] text-lol-gold'>
          {t('seriesBan')}
        </h3>
      </div>

      <FearlessBar
        mode={fearlessMode}
        onChange={onFearlessModeChange}
        usedCount={usedCount}
        totalCount={CHAMPION_NAMES.length}
      />

      {games.length === 0 ? (
        <div className='rounded-lg border border-lol-border bg-lol-bg-card/60 py-5 text-center'>
          <p className='lol-desc mb-2 text-lol-muted'>{t('noBansYet')}</p>
          <button type='button' onClick={addGame} className='lol-btn-primary rounded-lg py-2 px-4'>
            {t('addGameBans')}
          </button>
        </div>
      ) : (
        <>
          {games.map((game, gameIndex) => (
            <div
              key={gameIndex}
              className='overflow-hidden rounded-lg border border-lol-border bg-lol-bg-card/70'
            >
              <div className='flex items-center justify-between border-b border-lol-border/60 bg-lol-card/40 px-2.5 py-1.5'>
                <span className='font-cinzel text-xs font-bold uppercase tracking-wider text-lol-gold'>
                  {t('game')} {gameIndex + 1}
                </span>
                <button
                  type='button'
                  onClick={() => resetGame(gameIndex)}
                  className='lol-desc text-lol-muted transition-colors hover:text-amber-400'
                  title={t('resetGameBansTitle')}
                >
                  {t('resetGameBans')}
                </button>
              </div>

              <div className='grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2'>
                {(['blue', 'red'] as TeamKind[]).map((team) => (
                  <TeamDraftColumn
                    key={team}
                    team={team}
                    gameIndex={gameIndex}
                    bans={ensureFive(team === 'blue' ? game.blueBans : game.redBans)}
                    picks={ensureFive(team === 'blue' ? game.bluePicks : game.redPicks)}
                    pickingFor={pickingFor}
                    labels={{
                      team: team === 'blue' ? t('teamBlue') : t('teamRed'),
                      ban: t('banLabel'),
                      pick: t('pickLabel'),
                      empty: t('emptySlot'),
                      clear: t('unban'),
                    }}
                    onOpen={(kind) => {
                      const slots = ensureFive(
                        game[slotKey(team, kind)],
                      );
                      const idx = firstEmptySlot(slots);
                      setPickingFor({
                        gameIndex,
                        team,
                        kind,
                        slotIndex: idx < SLOT_COUNT ? idx : SLOT_COUNT - 1,
                      });
                    }}
                    onFocusSlot={(kind, slotIndex) =>
                      setPickingFor({ gameIndex, team, kind, slotIndex })
                    }
                    onClear={(kind, slotIndex) => clearSlot(gameIndex, team, kind, slotIndex)}
                  />
                ))}
              </div>

              {pickingFor?.gameIndex === gameIndex && (
                <ChampionGrid
                  games={games}
                  game={game}
                  pickingFor={pickingFor}
                  fearlessMode={fearlessMode}
                  searchQuery={searchQuery}
                  roleFilter={roleFilter}
                  onSearchChange={setSearchQuery}
                  onSelect={handleSelect}
                  onClose={() => setPickingFor(null)}
                />
              )}
            </div>
          ))}
          <button
            type='button'
            onClick={addGame}
            className='lol-btn-secondary w-full rounded-lg py-1.5 sm:w-auto sm:min-w-[140px]'
          >
            {t('addNextGameBans')}
          </button>
        </>
      )}
    </section>
  );
}

/** 피어리스 모드 선택 + 시리즈 사용 현황 */
function FearlessBar({
  mode,
  onChange,
  usedCount,
  totalCount,
}: {
  mode: FearlessMode;
  onChange: (mode: FearlessMode) => void;
  usedCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  const label: Record<FearlessMode, string> = {
    off: t('fearlessOff'),
    half: t('fearlessHalf'),
    full: t('fearlessFull'),
  };
  const title: Record<FearlessMode, string> = {
    off: t('fearlessOffTitle'),
    half: t('fearlessHalfTitle'),
    full: t('fearlessFullTitle'),
  };

  return (
    <div className='flex flex-col gap-2 rounded-lg border border-lol-border bg-lol-bg-card/70 px-3 py-2.5'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <span className='font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-lol-gold'>
          {t('fearlessTitle')}
        </span>
        <div
          role='radiogroup'
          aria-label={t('fearlessTitle')}
          className='inline-flex overflow-hidden rounded-lg border border-lol-border bg-lol-bg-card'
        >
          {FEARLESS_MODES.map((m) => (
            <label
              key={m}
              title={title[m]}
              className={cn(
                'lol-desc cursor-pointer select-none border-r border-lol-border px-3 py-1.5 transition-colors last:border-r-0',
                mode === m
                  ? 'bg-lol-gold/20 text-lol-gold-bright'
                  : 'text-lol-muted hover:bg-lol-card/50 hover:text-lol-gold-bright',
              )}
            >
              <input
                type='radio'
                name='fearless-mode'
                value={m}
                checked={mode === m}
                onChange={() => onChange(m)}
                className='sr-only'
              />
              {label[m]}
            </label>
          ))}
        </div>
        {mode !== 'off' && (
          <span className='lol-desc text-lol-muted'>
            {t('fearlessUsedCount')} {usedCount} · {t('fearlessRemaining')}{' '}
            {Math.max(0, totalCount - usedCount)}
          </span>
        )}
      </div>
      {mode !== 'off' && <p className='lol-desc text-lol-muted/80'>{t('fearlessNote')}</p>}
    </div>
  );
}

/** 한 팀의 밴 5칸 + 픽 5칸 */
function TeamDraftColumn({
  team,
  gameIndex,
  bans,
  picks,
  pickingFor,
  labels,
  onOpen,
  onFocusSlot,
  onClear,
}: {
  team: TeamKind;
  gameIndex: number;
  bans: string[];
  picks: string[];
  pickingFor: PickingFor | null;
  labels: { team: string; ban: string; pick: string; empty: string; clear: string };
  onOpen: (kind: SlotKind) => void;
  onFocusSlot: (kind: SlotKind, slotIndex: number) => void;
  onClear: (kind: SlotKind, slotIndex: number) => void;
}) {
  const isBlue = team === 'blue';
  const activeHere = pickingFor?.gameIndex === gameIndex && pickingFor.team === team;

  const row = (kind: SlotKind, slots: string[], label: string) => {
    const active = activeHere && pickingFor?.kind === kind;
    return (
      <div
        className={cn(
          'rounded-lg px-2 py-1.5 transition-all',
          active && 'bg-lol-gold/5 ring-1 ring-lol-gold/40',
        )}
      >
        <button
          type='button'
          onClick={() => onOpen(kind)}
          className='lol-desc mb-1 font-semibold text-lol-muted transition-colors hover:text-lol-gold-bright'
        >
          {label}
        </button>
        <div className='flex flex-wrap gap-1'>
          {slots.map((name, slotIndex) => (
            <DraftSlot
              key={slotIndex}
              championName={name}
              kind={kind}
              emptyLabel={labels.empty}
              clearLabel={labels.clear}
              focused={active && pickingFor?.slotIndex === slotIndex}
              onFocus={() => onFocusSlot(kind, slotIndex)}
              onClear={(e) => {
                e.stopPropagation();
                onClear(kind, slotIndex);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'rounded-lg border-l-2 p-1.5',
        isBlue
          ? 'border-lol-blue-border bg-lol-blue/25'
          : 'border-lol-red-border bg-lol-red/25',
      )}
    >
      <p
        className={cn(
          'lol-desc mb-1 px-2 font-cinzel text-xs font-bold uppercase tracking-[0.2em]',
          isBlue ? 'text-blue-300/90' : 'text-red-300/90',
        )}
      >
        {labels.team}
      </p>
      {row('ban', bans, labels.ban)}
      {row('pick', picks, labels.pick)}
    </div>
  );
}

function DraftSlot({
  championName,
  kind,
  emptyLabel,
  clearLabel,
  focused,
  onFocus,
  onClear,
}: {
  championName: string;
  kind: SlotKind;
  emptyLabel: string;
  clearLabel: string;
  focused: boolean;
  onFocus: () => void;
  onClear: (e: React.MouseEvent) => void;
}) {
  const filled = championName.trim() !== '';
  const isBan = kind === 'ban';

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={onFocus}
        title={filled ? championName : emptyLabel}
        className={cn(
          'series-ban-cell relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-lol-card transition-all',
          isBan ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-12 w-12 sm:h-14 sm:w-14',
          focused ? 'border-lol-gold ring-1 ring-lol-gold/60' : 'border-lol-border',
        )}
      >
        {filled ? (
          <>
            <Image
              src={`/champion/${encodeURIComponent(championName)}.webp`}
              alt=''
              width={56}
              height={56}
              className={cn(
                'relative z-10 h-full w-full object-cover object-top',
                // 밴은 흑백 처리해 픽과 한눈에 구분
                isBan && 'grayscale',
              )}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className='series-ban-fallback absolute inset-0 z-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright'>
              {championName.length > 2 ? championName.slice(0, 2) : championName}
            </span>
            {isBan && (
              <span className='pointer-events-none absolute inset-0 z-20 bg-black/25'>
                <span className='absolute left-1/2 top-1/2 h-[2px] w-[132%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-500/90 shadow-[0_0_6px_rgba(239,68,68,0.75)]' />
              </span>
            )}
          </>
        ) : (
          <span className='text-2xl text-lol-muted/60'>+</span>
        )}
      </button>
      {filled && (
        <button
          type='button'
          onClick={onClear}
          className='absolute -right-0.5 -top-0.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white hover:bg-red-500'
          aria-label={clearLabel}
          title={clearLabel}
        >
          ×
        </button>
      )}
    </div>
  );
}

/** 인라인 챔피언 선택 목록. 같은 경기 중복 + 피어리스 잠금을 비활성화 처리 */
function ChampionGrid({
  games,
  game,
  pickingFor,
  fearlessMode,
  searchQuery,
  roleFilter,
  onSearchChange,
  onSelect,
  onClose,
}: {
  games: SeriesDraft;
  game: SeriesDraft[number];
  pickingFor: PickingFor;
  fearlessMode: FearlessMode;
  searchQuery: string;
  roleFilter: Role | null;
  onSearchChange: (q: string) => void;
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  const { t, roleLabels } = useTranslation();

  const taken = usedInGame(game);
  const currentValue = ensureFive(game[slotKey(pickingFor.team, pickingFor.kind)])[
    pickingFor.slotIndex
  ];
  if (currentValue) taken.delete(currentValue);

  const locks =
    pickingFor.kind === 'pick'
      ? fearlessLocks(games, pickingFor.gameIndex, fearlessMode, pickingFor.team)
      : new Map<string, number>();

  let champions = filterChampionsBySearch(searchQuery);
  if (roleFilter) champions = champions.filter(({ name }) => isChampionInRole(name, roleFilter));

  return (
    <div className='border-t border-lol-border/70 px-2.5 py-1.5'>
      <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <span className='lol-desc text-lol-muted'>
          {t('selectChampion')} · {t('game')} {pickingFor.gameIndex + 1} ·{' '}
          {pickingFor.team === 'blue' ? t('teamBlue') : t('teamRed')}{' '}
          {pickingFor.kind === 'ban' ? t('banLabel') : t('pickLabel')} {t('slotLabel')}{' '}
          {pickingFor.slotIndex + 1}
        </span>
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchChampion')}
            className='lol-input w-full min-w-0 max-w-[200px] rounded-lg border border-lol-border bg-lol-bg-card px-3 py-1.5 text-sm transition-all duration-200 placeholder:text-lol-muted focus:border-lol-gold/60 focus:outline-none focus:ring-1 focus:ring-lol-gold/40 sm:max-w-[220px]'
            aria-label={t('searchChampion')}
          />
          <button
            type='button'
            onClick={onClose}
            className='lol-desc shrink-0 text-lol-muted transition-colors hover:text-lol-gold'
          >
            {t('cancelSelect')}
          </button>
        </div>
      </div>
      <div className='flex h-[280px] max-h-[280px] min-h-[280px] flex-wrap content-start justify-start gap-1.5 overflow-y-auto'>
        {champions.map(({ name }) => {
          const lockedAt = locks.get(name);
          const disabled = taken.has(name) || lockedAt !== undefined;
          const title = taken.has(name)
            ? `${name} (${t('alreadyUsedInGame')})`
            : lockedAt !== undefined
              ? `${name} (${t('fearlessUsedInGame').replace('{n}', String(lockedAt + 1))})`
              : name;
          return (
            <button
              key={name}
              type='button'
              disabled={disabled}
              onClick={() => onSelect(name)}
              className={cn(
                'series-ban-cell relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-lol-border bg-lol-card transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-lol-gold/50 sm:h-12 sm:w-12',
                disabled
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:scale-[1.03] hover:border-lol-gold/60 hover:bg-lol-card/90',
              )}
              title={title}
            >
              <Image
                src={`/champion/${encodeURIComponent(name)}.webp`}
                alt=''
                width={48}
                height={48}
                className='relative z-10 h-full w-full object-cover object-top'
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className='series-ban-fallback absolute inset-0 z-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright'>
                {name.length > 2 ? name.slice(0, 2) : name}
              </span>
              {lockedAt !== undefined && (
                <span className='absolute inset-x-0 bottom-0 z-20 bg-black/75 text-center text-[9px] font-bold leading-tight text-amber-300'>
                  G{lockedAt + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {champions.length === 0 && (
        <p className='lol-desc mt-2 text-center text-sm text-lol-muted'>
          {searchQuery.trim()
            ? `"${searchQuery}" — ${t('searchNoResults')}`
            : roleFilter
              ? `${roleLabels[roleFilter]} — ${t('searchNoResults')}`
              : null}
        </p>
      )}
    </div>
  );
}
