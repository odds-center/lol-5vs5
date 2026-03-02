import type { Player } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * MMR 기준 스네이크 드래프트: 1·2위 → 각 팀, 3·4위 → 각 팀, … 반반 분배.
 * MMR 순서만으로 분배하며, 평균(밸런스)만 고려. 동점·오차 편차 없이 정렬 순 그대로 적용.
 */
export function divideTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== 10) {
    throw new Error('정확히 10명이어야 합니다.');
  }

  const sorted = [...players].sort((a, b) => b.mmr - a.mmr);

  const teamA: Player[] = [];
  const teamB: Player[] = [];
  for (let j = 0; j < 10; j++) {
    if (j % 2 === 0) teamA.push(sorted[j]);
    else teamB.push(sorted[j]);
  }

  return { teamA, teamB };
}

/**
 * 10명을 랜덤 셔플 후 앞 5명 → 1팀, 뒤 5명 → 2팀.
 * "다시 나누기"에서 호출해 누를 때마다 다른 조합이 나오도록 함.
 */
export function divideTeamsRandom(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  if (players.length !== 10) {
    throw new Error('정확히 10명이어야 합니다.');
  }
  const shuffled = shuffle(players);
  return {
    teamA: shuffled.slice(0, 5),
    teamB: shuffled.slice(5, 10),
  };
}
