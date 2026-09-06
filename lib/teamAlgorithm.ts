import type { FixedTeam, LinkedPairs, Player } from '@/types';

/** 팀 고정 시 한 팀에 들어갈 수 있는 최대 인원 */
export const TEAM_SIZE = 5;

type Side = 'A' | 'B';

/** 같은 팀 묶음 하나. fixed가 있으면 그 팀에 반드시 배치 */
interface Unit {
  players: Player[];
  mmr: number;
  fixed: Side | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSide(f: FixedTeam | undefined): f is Side {
  return f === 'A' || f === 'B';
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
  return Array.from(byRoot.values());
}

/**
 * 플레이어 목록을 "유닛"(같은 팀 묶음 또는 1명) 배열로.
 * 묶음 안에 서로 다른 팀 고정이 섞여 있으면 예외.
 */
function buildUnits(players: Player[], linkedPairs: LinkedPairs): Unit[] {
  const allIds = players.map((p) => p.id);
  const groups = mergePairsIntoGroups(linkedPairs, allIds);
  const idToPlayer = new Map(players.map((p) => [p.id, p]));
  return groups.map((ids) => {
    const members = ids.map((id) => idToPlayer.get(id)!).filter(Boolean);
    let fixed: Side | null = null;
    for (const p of members) {
      if (!isSide(p.fixedTeam)) continue;
      if (fixed && fixed !== p.fixedTeam) {
        throw new Error('같은 팀으로 지정된 참가자가 서로 다른 팀(1팀/2팀)에 고정되어 있습니다.');
      }
      fixed = p.fixedTeam;
    }
    return {
      players: members,
      mmr: members.reduce((s, p) => s + p.mmr, 0),
      fixed,
    };
  });
}

/** 팀 고정된 유닛을 먼저 자리에 앉히고, 남은(자유) 유닛을 반환 */
function seatFixedUnits(units: Unit[]): { teamA: Player[]; teamB: Player[]; free: Unit[] } {
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  const free: Unit[] = [];
  for (const unit of units) {
    if (unit.fixed === 'A') teamA.push(...unit.players);
    else if (unit.fixed === 'B') teamB.push(...unit.players);
    else free.push(unit);
  }
  if (teamA.length > TEAM_SIZE || teamB.length > TEAM_SIZE) {
    throw new Error(`한 팀에 고정할 수 있는 인원은 최대 ${TEAM_SIZE}명입니다.`);
  }
  return { teamA, teamB, free };
}

const IMPOSSIBLE = '팀 고정·같은 팀 지정 조합으로는 5:5 분배가 불가능합니다.';

function assertFull(teamA: Player[], teamB: Player[]): void {
  if (teamA.length !== TEAM_SIZE || teamB.length !== TEAM_SIZE) {
    throw new Error(IMPOSSIBLE);
  }
}

/** 팀 고정이나 같은 팀 지정이 하나라도 있으면 true (제약 없는 빠른 경로 판단용) */
function hasConstraints(units: Unit[]): boolean {
  return units.some((u) => u.players.length > 1 || u.fixed !== null);
}

/**
 * MMR 기준 스네이크 드래프트: 1·2위 → 각 팀, 3·4위 → 각 팀, … 반반 분배.
 * linkedPairs가 있으면 해당 쌍(묶음)은 항상 같은 팀에,
 * fixedTeam이 지정된 참가자는 항상 지정된 팀에 배치.
 */
export function divideTeams(
  players: Player[],
  linkedPairs: LinkedPairs = [],
): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== TEAM_SIZE * 2) {
    throw new Error('정확히 10명이어야 합니다.');
  }

  const units = buildUnits(players, linkedPairs);

  if (!hasConstraints(units)) {
    const sorted = [...players].sort((a, b) => b.mmr - a.mmr);
    const teamA: Player[] = [];
    const teamB: Player[] = [];
    for (let j = 0; j < players.length; j++) {
      if (j % 2 === 0) teamA.push(sorted[j]);
      else teamB.push(sorted[j]);
    }
    return { teamA, teamB };
  }

  const { teamA, teamB, free } = seatFixedUnits(units);
  let mmrA = teamA.reduce((s, p) => s + p.mmr, 0);
  let mmrB = teamB.reduce((s, p) => s + p.mmr, 0);

  // 큰 묶음 → MMR 높은 순으로 배치하며, 그때그때 합계가 낮은 팀에 넣어 균형을 맞춤
  const sorted = [...free].sort((a, b) => b.players.length - a.players.length || b.mmr - a.mmr);
  for (const unit of sorted) {
    const size = unit.players.length;
    const canA = teamA.length + size <= TEAM_SIZE;
    const canB = teamB.length + size <= TEAM_SIZE;
    if (!canA && !canB) throw new Error(IMPOSSIBLE);
    if (canA && (!canB || mmrA <= mmrB)) {
      teamA.push(...unit.players);
      mmrA += unit.mmr;
    } else {
      teamB.push(...unit.players);
      mmrB += unit.mmr;
    }
  }

  assertFull(teamA, teamB);
  return { teamA, teamB };
}

/**
 * 10명을 랜덤 셔플 후 5:5로 나눔.
 * linkedPairs 묶음은 같은 팀에, fixedTeam이 지정된 참가자는 지정된 팀에 그대로 둠.
 */
export function divideTeamsRandom(
  players: Player[],
  linkedPairs: LinkedPairs = [],
): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== TEAM_SIZE * 2) {
    throw new Error('정확히 10명이어야 합니다.');
  }

  const units = buildUnits(players, linkedPairs);

  if (!hasConstraints(units)) {
    const shuffled = shuffle(players);
    return {
      teamA: shuffled.slice(0, TEAM_SIZE),
      teamB: shuffled.slice(TEAM_SIZE),
    };
  }

  const { teamA, teamB, free } = seatFixedUnits(units);

  // 큰 묶음부터 자리를 잡아야 5:5가 깨지지 않음. 같은 크기끼리는 랜덤
  const ordered = shuffle(free).sort((a, b) => b.players.length - a.players.length);
  for (const unit of ordered) {
    const size = unit.players.length;
    const canA = teamA.length + size <= TEAM_SIZE;
    const canB = teamB.length + size <= TEAM_SIZE;
    if (!canA && !canB) throw new Error(IMPOSSIBLE);
    const toA = canA && canB ? Math.random() < 0.5 : canA;
    if (toA) teamA.push(...unit.players);
    else teamB.push(...unit.players);
  }

  assertFull(teamA, teamB);
  return { teamA, teamB };
}
