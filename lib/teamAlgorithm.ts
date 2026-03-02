import type { LinkedPairs, Player } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 연결된 쌍을 하나의 그룹으로 합침 (같은 팀에 넣어야 하는 묶음). player id 기준 */
function mergePairsIntoGroups(pairs: LinkedPairs, allIds: string[]): string[][] {
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    const p = parent.get(id)!;
    if (p === id) return id;
    const root = find(p);
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const [id1, id2] of pairs) {
    if (allIds.includes(id1) && allIds.includes(id2)) union(id1, id2);
  }

  const byRoot = new Map<string, string[]>();
  for (const id of allIds) {
    const r = find(id);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r)!.push(id);
  }
  return [...byRoot.values()];
}

/** 플레이어 목록을 "유닛"(같은 팀 묶음 또는 1명) 배열로. linkedPairs 있으면 묶음 적용 */
function buildUnits(players: Player[], linkedPairs: LinkedPairs): Player[][] {
  const allIds = players.map((p) => p.id);
  const groups = mergePairsIntoGroups(linkedPairs, allIds);
  const idToPlayer = new Map(players.map((p) => [p.id, p]));
  return groups.map((ids) => ids.map((id) => idToPlayer.get(id)!).filter(Boolean));
}

/**
 * MMR 기준 스네이크 드래프트: 1·2위 → 각 팀, 3·4위 → 각 팀, … 반반 분배.
 * linkedPairs가 있으면 해당 쌍(묶음)은 항상 같은 팀에 배치.
 */
export function divideTeams(
  players: Player[],
  linkedPairs: LinkedPairs = [],
): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== 10) {
    throw new Error('정확히 10명이어야 합니다.');
  }

  if (linkedPairs.length === 0) {
    const sorted = [...players].sort((a, b) => b.mmr - a.mmr);
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    for (let j = 0; j < 10; j++) {
      if (j % 2 === 0) teamA.push(sorted[j]);
      else teamB.push(sorted[j]);
    }
    return { teamA, teamB };
  }

  const units = buildUnits(players, linkedPairs);
  const unitMmrs = units.map((u) => u.reduce((s, p) => s + p.mmr, 0));
  const sortedUnitIndices = units
    .map((_, i) => i)
    .sort((a, b) => unitMmrs[b] - unitMmrs[a]);

  let mmrA = 0;
  let mmrB = 0;
  const teamA: Player[] = [];
  const teamB: Player[] = [];

  for (const idx of sortedUnitIndices) {
    const unit = units[idx];
    const size = unit.length;
    const canA = teamA.length + size <= 5;
    const canB = teamB.length + size <= 5;
    if (!canA && !canB) throw new Error('같은 팀 지정 조합으로는 5:5 분배가 불가능합니다.');
    if (canA && !canB) {
      teamA.push(...unit);
      mmrA += unitMmrs[idx];
    } else if (!canA && canB) {
      teamB.push(...unit);
      mmrB += unitMmrs[idx];
    } else {
      if (mmrA <= mmrB) {
        teamA.push(...unit);
        mmrA += unitMmrs[idx];
      } else {
        teamB.push(...unit);
        mmrB += unitMmrs[idx];
      }
    }
  }

  return { teamA, teamB };
}

/**
 * 10명을 랜덤 셔플 후 앞 5명 → 1팀, 뒤 5명 → 2팀.
 * linkedPairs가 있으면 묶음 단위로 셔플하여 같은 팀에 넣음.
 */
export function divideTeamsRandom(
  players: Player[],
  linkedPairs: LinkedPairs = [],
): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== 10) {
    throw new Error('정확히 10명이어야 합니다.');
  }

  if (linkedPairs.length === 0) {
    const shuffled = shuffle(players);
    return {
      teamA: shuffled.slice(0, 5),
      teamB: shuffled.slice(5, 10),
    };
  }

  const units = buildUnits(players, linkedPairs);
  const shuffledUnits = shuffle(units);
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let countA = 0;
  for (const unit of shuffledUnits) {
    if (countA + unit.length <= 5) {
      teamA.push(...unit);
      countA += unit.length;
    } else {
      teamB.push(...unit);
    }
  }
  if (teamA.length !== 5 || teamB.length !== 5) {
    throw new Error('같은 팀 지정 조합으로는 5:5 분배가 불가능합니다.');
  }
  return { teamA, teamB };
}
