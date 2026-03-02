'use client';

import { useState } from 'react';
import type { SeriesBans } from '@/types';
import { CHAMPION_NAMES } from '@/lib/randomNames';

const SLOT_COUNT = 5;
const CHAMPION_LIST_HEIGHT = 280;
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
  const [pickingFor, setPickingFor] = useState<{
    gameIndex: number;
    team: TeamKind;
    slotIndex: number;
  } | null>(null);

  const setBan = (gameIndex: number, team: TeamKind, slotIndex: number, name: string) => {
    const next = games.map((g, i) => {
      if (i !== gameIndex) return g;
      const blue = ensureFive(g.blueBans);
      const red = ensureFive(g.redBans);
      if (team === 'blue') blue[slotIndex] = name;
      else red[slotIndex] = name;
      return { blueBans: blue, redBans: red };
    });
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

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-center font-cinzel text-sm font-bold uppercase tracking-[0.25em] text-lol-gold">
        Series Ban
      </h3>

      {games.length === 0 ? (
        <div className="rounded-lg border border-lol-border bg-lol-bg-card/60 py-5 text-center">
          <p className="lol-desc mb-2 text-lol-muted">아직 밴 목록이 없습니다.</p>
          <button type="button" onClick={addGame} className="lol-btn-primary rounded-lg py-2 px-4">
            1경기 밴 추가
          </button>
        </div>
      ) : (
        <>
          {games.map((game, gameIndex) => (
            <div key={gameIndex} className="rounded-lg border border-lol-border bg-lol-bg-card/70">
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-lol-gold">
                  경기 {gameIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => resetGameBans(gameIndex)}
                  className="lol-desc text-lol-muted hover:text-amber-400"
                  title="이 경기의 블루/레드 밴 목록만 비웁니다"
                >
                  이 경기 밴 초기화
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 px-2.5 pb-2 sm:grid-cols-2">
                <TeamBanRow
                  teamLabel="블루 팀 밴"
                  teamColor="blue"
                  bans={ensureFive(game.blueBans)}
                  gameIndex={gameIndex}
                  pickingFor={pickingFor}
                  onSelectTeam={() => {
                    const idx = firstEmptySlot(game.blueBans);
                    if (idx < SLOT_COUNT) setPickingFor({ gameIndex, team: 'blue', slotIndex: idx });
                  }}
                  onClear={(slotIndex) => clearBan(gameIndex, 'blue', slotIndex)}
                />
                <TeamBanRow
                  teamLabel="레드 팀 밴"
                  teamColor="red"
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
              {pickingFor?.gameIndex === gameIndex && (
                <div className="border-t border-lol-border/70 px-2.5 py-1.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="lol-desc text-lol-muted">
                      챔피언 선택 · 경기 {gameIndex + 1} ·{' '}
                      {pickingFor.team === 'blue' ? '블루' : '레드'} 팀 슬롯 {pickingFor.slotIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickingFor(null)}
                      className="lol-desc text-lol-muted hover:text-lol-gold"
                    >
                      선택 취소
                    </button>
                  </div>
                  <div
                    className="flex flex-wrap justify-center gap-1.5 overflow-y-auto"
                    style={{ maxHeight: CHAMPION_LIST_HEIGHT }}
                  >
                    {CHAMPION_NAMES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelect(name, gameIndex)}
                        className="series-ban-cell relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-lol-border bg-lol-card transition-colors hover:border-lol-gold/60 hover:bg-lol-card/90 sm:h-12 sm:w-12"
                        title={name}
                      >
                        <img
                          src={`/champion/${encodeURIComponent(name)}.webp`}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          onLoad={(e) =>
                            e.currentTarget.closest('button')?.setAttribute('data-img-loaded', '')
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="series-ban-fallback absolute inset-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright">
                          {name.length > 2 ? name.slice(0, 2) : name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addGame}
            className="lol-btn-secondary w-full rounded-lg py-1.5 sm:w-auto sm:min-w-[140px]"
          >
            다음 경기 밴 추가
          </button>
        </>
      )}

    </section>
  );
}

function TeamBanRow({
  teamLabel,
  teamColor,
  bans,
  gameIndex,
  pickingFor,
  onSelectTeam,
  onClear,
}: {
  teamLabel: string;
  teamColor: 'blue' | 'red';
  bans: string[];
  gameIndex: number;
  pickingFor: { gameIndex: number; team: TeamKind; slotIndex: number } | null;
  onSelectTeam: () => void;
  onClear: (slotIndex: number) => void;
}) {
  const isBlue = teamColor === 'blue';
  const team: TeamKind = isBlue ? 'blue' : 'red';
  const isSelected =
    pickingFor?.gameIndex === gameIndex && pickingFor?.team === team;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectTeam}
      onKeyDown={(e) => e.key === 'Enter' && onSelectTeam()}
      className={`cursor-pointer rounded-lg p-2 transition-all ${
        isBlue ? 'bg-lol-blue/25' : 'bg-lol-red/25'
      } ${isBlue ? 'border-l border-lol-blue-border' : 'border-l border-lol-red-border'} ${
        isSelected ? 'ring-1 ring-lol-gold/50' : ''
      }`}
    >
      <p className="lol-desc mb-1 font-semibold text-lol-muted">
        {teamLabel}
        {isSelected && <span className="ml-1 text-lol-gold">(선택됨)</span>}
      </p>
      <div className="flex flex-wrap justify-center gap-1">
        {bans.map((name, slotIndex) => (
          <BanSlot
            key={slotIndex}
            championName={name}
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
  onClear,
}: {
  championName: string;
  onClear: (e: React.MouseEvent) => void;
}) {
  const filled = championName.trim() !== '';

  return (
    <div className="relative">
      <div
        className="series-ban-cell relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-lol-border bg-lol-card transition-all sm:h-14 sm:w-14"
        title={filled ? championName : '빈 슬롯'}
      >
        {filled ? (
          <>
            <img
              src={`/champion/${encodeURIComponent(championName)}.webp`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-top"
              onLoad={(e) =>
                e.currentTarget.closest('.series-ban-cell')?.setAttribute('data-img-loaded', '')
              }
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="series-ban-fallback absolute inset-0 flex items-center justify-center bg-lol-bg-card/90 text-xs font-medium text-lol-gold-bright">
              {championName.length > 2 ? championName.slice(0, 2) : championName}
            </span>
          </>
        ) : (
          <span className="text-2xl text-lol-muted/60">+</span>
        )}
      </div>
      {filled && (
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-0.5 -top-0.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white hover:bg-red-500"
          aria-label="밴 해제"
          title="밴 해제"
        >
          ×
        </button>
      )}
    </div>
  );
}
