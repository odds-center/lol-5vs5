import type { FearlessMode, GameDraft, SeriesDraft, TeamKind } from '@/types';

export const SLOT_COUNT = 5;

/** 배열을 항상 5칸으로 (모자라면 빈 문자열로 채움) */
export function ensureFive(arr: string[] | undefined): string[] {
  const a = [...(arr ?? [])].slice(0, SLOT_COUNT);
  while (a.length < SLOT_COUNT) a.push('');
  return a;
}

export function emptyGame(): GameDraft {
  return {
    blueBans: [],
    redBans: [],
    bluePicks: [],
    redPicks: [],
  };
}

function nonEmpty(names: string[]): string[] {
  return names.filter((n) => n.trim() !== '');
}

/**
 * 한 경기에서 실제로 "사용된" 챔피언 = 픽.
 * 밴은 아무도 플레이하지 않았으므로 피어리스 잠금 대상이 아님.
 */
export function pickedInGame(game: GameDraft, side?: TeamKind): string[] {
  if (side === 'blue') return nonEmpty(ensureFive(game.bluePicks));
  if (side === 'red') return nonEmpty(ensureFive(game.redPicks));
  return [...nonEmpty(ensureFive(game.bluePicks)), ...nonEmpty(ensureFive(game.redPicks))];
}

/** 한 경기에서 이미 밴 또는 픽된 챔피언 (같은 경기 내 중복 방지용) */
export function usedInGame(game: GameDraft): Set<string> {
  return new Set([
    ...nonEmpty(ensureFive(game.blueBans)),
    ...nonEmpty(ensureFive(game.redBans)),
    ...pickedInGame(game),
  ]);
}

/**
 * gameIndex 경기에서 side 팀이 더 이상 픽할 수 없는 챔피언 → 최초 사용 경기 인덱스(0-based).
 * 이전 경기들만 대상으로 하며, 같은 경기 내 중복은 usedInGame이 담당.
 */
export function fearlessLocks(
  games: SeriesDraft,
  gameIndex: number,
  mode: FearlessMode,
  side: TeamKind,
): Map<string, number> {
  const locks = new Map<string, number>();
  if (mode === 'off') return locks;
  const until = Math.min(gameIndex, games.length);
  for (let i = 0; i < until; i++) {
    const used = mode === 'half' ? pickedInGame(games[i], side) : pickedInGame(games[i]);
    for (const name of used) {
      if (!locks.has(name)) locks.set(name, i);
    }
  }
  return locks;
}

/** 시리즈에서 지금까지(gameIndex 경기 포함) 픽된 챔피언 전체 */
export function allPickedChampions(games: SeriesDraft, upToGameIndex?: number): Set<string> {
  const until = upToGameIndex === undefined ? games.length : Math.min(upToGameIndex + 1, games.length);
  const set = new Set<string>();
  for (let i = 0; i < until; i++) {
    for (const name of pickedInGame(games[i])) set.add(name);
  }
  return set;
}
