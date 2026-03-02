import type { Player } from '@/types';
import { ROLES, type Role } from '@/types';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 팀 5명을 5개 역할에 1:1 랜덤 매핑
 */
export function assignRoles(team: Player[]): Record<Role, Player> {
  if (team.length !== 5) {
    throw new Error('팀은 5명이어야 합니다.');
  }
  const shuffled = shuffle(team);
  const result = {} as Record<Role, Player>;
  ROLES.forEach((role, i) => {
    result[role] = shuffled[i];
  });
  return result;
}

/**
 * 선호 역할을 반영해 배정. 선호가 겹치면 랜덤, 미정이면 남은 역할에 배정.
 */
export function assignRolesWithPreferences(team: Player[]): Record<Role, Player> {
  if (team.length !== 5) {
    throw new Error('팀은 5명이어야 합니다.');
  }

  const result = {} as Record<Role, Player>;
  const assigned = new Set<string>();
  const usedRoles = new Set<Role>();

  const pref = team.map((p) => {
    const r = p.rolePreference ?? '';
    return { player: p, role: (r !== '' ? r : null) as Role | null };
  });

  const byRole = new Map<Role, typeof pref>();
  for (const { player, role } of pref) {
    if (!role) continue;
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role)!.push({ player, role });
  }

  const remainingRoles = () => ROLES.filter((r) => !usedRoles.has(r));
  const remainingPlayers = () => team.filter((p) => !assigned.has(p.id));

  for (const role of ROLES) {
    const candidates = byRole.get(role)?.filter((x) => !assigned.has(x.player.id)) ?? [];
    if (candidates.length === 1) {
      result[role] = candidates[0].player;
      assigned.add(candidates[0].player.id);
      usedRoles.add(role);
    } else if (candidates.length > 1) {
      const shuffled = shuffle(candidates);
      result[role] = shuffled[0].player;
      assigned.add(shuffled[0].player.id);
      usedRoles.add(role);
    }
  }

  const leftRoles = remainingRoles();
  const leftPlayers = remainingPlayers();
  const leftShuffled = shuffle(leftPlayers);
  leftRoles.forEach((role, i) => {
    if (leftShuffled[i]) {
      result[role] = leftShuffled[i];
      assigned.add(leftShuffled[i].id);
    }
  });

  return result;
}
