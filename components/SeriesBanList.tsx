'use client';

import { useState, useEffect } from 'react';
import type { SeriesBans } from '@/types';
import { ROLES, type Role } from '@/types';
import { filterChampionsBySearch } from '@/lib/randomNames';
import { isChampionInRole } from '@/lib/championRoles';
import Image from 'next/image';
import { useTranslation } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';
import { preloadChampionImages } from '@/lib/preload';
import RoleIcon from './RoleIcon';

const SLOT_COUNT = 5;
type TeamKind = 'blue' | 'red';

interface SeriesBanListProps {
  games: SeriesBans;
  onUpdate: (next: SeriesBans) => void;
}

function ensureFive(arr: string[]): string[] {
  const a = [...arr].slice(0, SLOT_COUNT);
  while (a.length < SLOT_COUNT) a.push('');
  return a;
}

/** 해당 팀 밴 배열에서 비는 첫 슬롯 인덱스 (0~4). 다 차 있으면 5 */
function firstEmptySlot(bans: string[]): number {
  const a = ensureFive(bans);
  const i = a.findIndex((s) => !s.trim());
  return i < 0 ? SLOT_COUNT : i;
}

/**
 * 경기별 블루팀 5밴 / 레드팀 5밴. 슬롯 클릭 시 해당 경기 아래에 높이 제한된 챔피언 목록 인라인 표시.
 */
export default function SeriesBanList({ games, onUpdate }: SeriesBanListProps) {
  const { t, roleLabels } = useTranslation();
  const [pickingFor, setPickingFor] = useState<{
    gameIndex: number;
    team: TeamKind;
    slotIndex: number;
  } | null>(null);
  const [banSearchQuery, setBanSearchQuery] = useState('');
  const [banRoleFilter, setBanRoleFilter] = useState<Role | null>(null);

  useEffect(() => {
    if (!pickingFor) setBanSearchQuery('');
  }, [pickingFor]);

  // 챔피언 선택 패널이 열리면 현재 목록 이미지 미리 로드
  useEffect(() => {
    if (!pickingFor) return;
    let list = filterChampionsBySearch(banSearchQuery);
    if (banRoleFilter) list = list.filter(({ name }) => isChampionInRole(name, banRoleFilter));
    preloadChampionImages(list.map(({ name }) => name), 60);
  }, [pickingFor, banSearchQuery, banRoleFilter]);

  const setBan = (gameIndex: number, team: TeamKind, slotIndex: number, name: string) => {
    const g = games[gameIndex];
    if (!g) return;
    const blue = ensureFive(g.blueBans);
    const red = ensureFive(g.redBans);
    const alreadyBanned = new Set([...blue, ...red].filter(Boolean));
    if (alreadyBanned.has(name)) return; // 같은 경기 내 중복 벤 방지
    if (team === 'blue') blue[slotIndex] = name;
    else red[slotIndex] = name;
    const next = games.map((game, i) =>
      i === gameIndex ? { blueBans: blue, redBans: red } : game,
    );
    onUpdate(next);
  };

  const clearBan = (gameIndex: number, team: TeamKind, slotIndex: number) => {
    const next = games.map((g, i) => {
      if (i !== gameIndex) return g;
      const blue = ensureFive(g.blueBans);
      const red = ensureFive(g.redBans);
      if (team === 'blue') blue[slotIndex] = '';
      else red[slotIndex] = '';
      return { blueBans: blue, redBans: red };
    });
    onUpdate(next);
  };

  const addGame = () => {
    onUpdate([...games, { blueBans: [], redBans: [] }]);
  };

  /** 해당 경기의 블루·레드 밴만 비우기 */
  const resetGameBans = (gameIndex: number) => {
    const next = games.map((g, i) =>
      i === gameIndex ? { blueBans: [] as string[], redBans: [] as string[] } : g,
    );
    onUpdate(next);
    setPickingFor(null);
  };

  const handleSelect = (name: string, gameIndex: number) => {
    if (!pickingFor || pickingFor.gameIndex !== gameIndex) return;
    const { team, slotIndex } = pickingFor;
    setBan(pickingFor.gameIndex, team, slotIndex, name);
    // 클릭한 순서대로 다음 슬롯으로 이동 (5개 채우면 종료)
    if (slotIndex + 1 < SLOT_COUNT) {
      setPickingFor({ gameIndex, team, slotIndex: slotIndex + 1 });
    } else {
      setPickingFor(null);
    }
  };

  const toggleRoleFilter = (role: Role) => {
    setBanRoleFilter((prev) => (prev === role ? null : role));
  };

  return (
    <section className='flex flex-col gap-2'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-1' role='tablist' aria-label={t('filterByRole')}>
          {(ROLES as Role[]).map((role) => (
            <button
              key={role}
              type='button'
              onClick={() => toggleRoleFilter(role)}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 sm:h-10 sm:w-10',
                banRoleFilter === role
                  ? 'border-lol-gold bg-lol-gold/20 ring-1 ring-lol-gold/50'
                  : 'border-lol-border bg-lol-bg-card hover:border-lol-gold/50 hover:bg-lol-card/80',
              )}
              title={roleLabels[role]}
              aria-pressed={banRoleFilter === role}
            >
              <RoleIcon role={role} size={20} className='opacity-90' />
            </button>
          ))}
        </div>
        <h3 className='font-cinzel text-sm font-bold uppercase tracking-[0.25em] text-lol-gold'>
          {t('seriesBan')}
        </h3>
      </div>

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
            <div key={gameIndex} className='rounded-lg border border-lol-border bg-lol-bg-card/70'>
              <div className='flex items-center justify-between px-2.5 py-1.5'>
                <span className='font-cinzel text-xs font-bold uppercase tracking-wider text-lol-gold'>
                  {t('game')} {gameIndex + 1}
                </span>
                <button
                  type='button'
                  onClick={() => resetGameBans(gameIndex)}
                  className='lol-desc text-lol-muted hover:text-amber-400'
                  title={t('resetGameBansTitle')}
                >
                  {t('resetGameBans')}
                </button>
              </div>
              <div className='grid grid-cols-1 gap-2 px-2.5 pb-2 sm:grid-cols-2'>
                <TeamBanRow
                  teamLabel={t('blueTeamBan')}
                  selectedLabel={t('selected')}
                  emptySlotLabel={t('emptySlot')}
                  unbanLabel={t('unban')}
                  teamColor='blue'
                  bans={ensureFive(game.blueBans)}
                  gameIndex={gameIndex}
                  pickingFor={pickingFor}
                  onSelectTeam={() => {
                    const idx = firstEmptySlot(game.blueBans);
                    if (idx < SLOT_COUNT)
                      setPickingFor({ gameIndex, team: 'blue', slotIndex: idx });
                  }}
                  onClear={(slotIndex) => clearBan(gameIndex, 'blue', slotIndex)}
                />
                <TeamBanRow
                  teamLabel={t('redTeamBan')}
                  selectedLabel={t('selected')}
                  emptySlotLabel={t('emptySlot')}
                  unbanLabel={t('unban')}
                  teamColor='red'
                  bans={ensureFive(game.redBans)}
                  gameIndex={gameIndex}
                  pickingFor={pickingFor}
                  onSelectTeam={() => {
                    const idx = firstEmptySlot(game.redBans);
                    if (idx < SLOT_COUNT) setPickingFor({ gameIndex, team: 'red', slotIndex: idx });
                  }}
                  onClear={(slotIndex) => clearBan(gameIndex, 'red', slotIndex)}
                />
              </div>
              {/* 챔피언 선택 목록: 이 경기가 선택된 경우에만 표시 (다른 경기 선택 시 close) */}
              {pickingFor?.gameIndex === gameIndex &&
                (() => {
                  const blue = ensureFive(game.blueBans);
                  const red = ensureFive(game.redBans);
                  const bannedInThisGame = new Set([...blue, ...red].filter(Boolean));
                  const currentSlotValue =
                    (pickingFor.team === 'blue' ? blue : red)[pickingFor.slotIndex]?.trim() ?? '';
                  if (currentSlotValue) bannedInThisGame.delete(currentSlotValue);
                  let filteredChampions = filterChampionsBySearch(banSearchQuery);
                  if (banRoleFilter) {
                    filteredChampions = filteredChampions.filter(({ name }) =>
                      isChampionInRole(name, banRoleFilter),
                    );
                  }
                  return (
                    <div className='border-t border-lol-border/70 px-2.5 py-1.5'>
                      <div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='lol-desc text-lol-muted'>
                          {t('selectChampion')} · {t('game')} {gameIndex + 1} ·{' '}
                          {pickingFor.team === 'blue' ? t('teamBlue') : t('teamRed')}{' '}
                          {t('slotLabel')} {pickingFor.slotIndex + 1}
                        </span>
                        <div className='flex items-center gap-2'>
                          <input
                            type='text'
                            value={banSearchQuery}
                            onChange={(e) => setBanSearchQuery(e.target.value)}
                            placeholder={t('searchChampion')}
                            className='lol-input w-full min-w-0 max-w-[200px] rounded-lg border border-lol-border bg-lol-bg-card px-3 py-1.5 text-sm transition-all duration-200 placeholder:text-lol-muted focus:border-lol-gold/60 focus:outline-none focus:ring-1 focus:ring-lol-gold/40 sm:max-w-[220px]'
                            aria-label={t('searchChampion')}
                          />
                          <button
                            type='button'
                            onClick={() => setPickingFor(null)}
                            className='lol-desc shrink-0 text-lol-muted transition-colors hover:text-lol-gold'
                          >
                            {t('cancelSelect')}
                          </button>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex flex-wrap justify-start content-start gap-1.5 overflow-y-auto transition-opacity duration-200',
                          'h-[280px] min-h-[280px] max-h-[280px]',
                        )}
                      >
                        {filteredChampions.map(({ name }) => {
                          const disabled = bannedInThisGame.has(name);
                          return (
                            <button
                              key={name}
                              type='button'
                              disabled={disabled}
                              onClick={() => handleSelect(name, gameIndex)}
                              className={cn(
                                'series-ban-cell relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-lol-border bg-lol-card transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-lol-gold/50 sm:h-12 sm:w-12',
                                disabled
                                  ? 'cursor-not-allowed scale-100 opacity-40 hover:scale-100'
                                  : 'hover:scale-[1.03] hover:border-lol-gold/60 hover:bg-lol-card/90',
                              )}
                              title={disabled ? `${name} (${t('alreadyBannedInGame')})` : name}
                            >
                              <Image
                                src={`/champion/${encodeURIComponent(name)}.webp`}
                                alt=""
                                width={48}
                                height={48}
                                className="relative z-10 h-full w-full object-cover object-top transition-opacity duration-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className='series-ban-fallback absolute inset-0 z-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright'>
                                {name.length > 2 ? name.slice(0, 2) : name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {filteredChampions.length === 0 && (
                        <p className='lol-desc mt-2 text-center text-sm text-lol-muted'>
                          {banSearchQuery.trim()
                            ? `"${banSearchQuery}" — ${t('searchNoResults')}`
                            : banRoleFilter
                              ? `${roleLabels[banRoleFilter]} — ${t('searchNoResults')}`
                              : null}
                        </p>
                      )}
                    </div>
                  );
                })()}
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

function TeamBanRow({
  teamLabel,
  selectedLabel,
  emptySlotLabel,
  unbanLabel,
  teamColor,
  bans,
  gameIndex,
  pickingFor,
  onSelectTeam,
  onClear,
}: {
  teamLabel: string;
  selectedLabel: string;
  emptySlotLabel: string;
  unbanLabel: string;
  teamColor: 'blue' | 'red';
  bans: string[];
  gameIndex: number;
  pickingFor: { gameIndex: number; team: TeamKind; slotIndex: number } | null;
  onSelectTeam: () => void;
  onClear: (slotIndex: number) => void;
}) {
  const isBlue = teamColor === 'blue';
  const team: TeamKind = isBlue ? 'blue' : 'red';
  const isSelected = pickingFor?.gameIndex === gameIndex && pickingFor?.team === team;
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onSelectTeam}
      onKeyDown={(e) => e.key === 'Enter' && onSelectTeam()}
      className={cn(
        'cursor-pointer rounded-lg p-2 transition-all',
        isBlue ? 'bg-lol-blue/25 border-l border-lol-blue-border' : 'bg-lol-red/25 border-l border-lol-red-border',
        isSelected && 'ring-1 ring-lol-gold/50',
      )}
    >
      <p className='lol-desc mb-1 font-semibold text-lol-muted'>
        {teamLabel}
        {isSelected && <span className='ml-1 text-lol-gold'>{selectedLabel}</span>}
      </p>
      <div className='flex flex-wrap justify-center gap-1'>
        {bans.map((name, slotIndex) => (
          <BanSlot
            key={slotIndex}
            championName={name}
            emptySlotLabel={emptySlotLabel}
            unbanLabel={unbanLabel}
            onClear={(e) => {
              e.stopPropagation();
              onClear(slotIndex);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function BanSlot({
  championName,
  emptySlotLabel,
  unbanLabel,
  onClear,
}: {
  championName: string;
  emptySlotLabel: string;
  unbanLabel: string;
  onClear: (e: React.MouseEvent) => void;
}) {
  const filled = championName.trim() !== '';

  return (
    <div className='relative'>
      <div
        className='series-ban-cell relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-lol-border bg-lol-card transition-all sm:h-14 sm:w-14'
        title={filled ? championName : emptySlotLabel}
      >
        {filled ? (
          <>
            <Image
              src={`/champion/${encodeURIComponent(championName)}.webp`}
              alt=""
              width={56}
              height={56}
              className="relative z-10 h-full w-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className='series-ban-fallback absolute inset-0 z-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright'>
              {championName.length > 2 ? championName.slice(0, 2) : championName}
            </span>
          </>
        ) : (
          <span className='text-2xl text-lol-muted/60'>+</span>
        )}
      </div>
      {filled && (
        <button
          type='button'
          onClick={onClear}
          className='absolute -right-0.5 -top-0.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white hover:bg-red-500'
          aria-label={unbanLabel}
          title={unbanLabel}
        >
          ×
        </button>
      )}
    </div>
  );
}
