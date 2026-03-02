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
 * 팀 5명을 5개 역할에 1:1 랜덤 매핑. bannedRoles가 있으면 해당 포지션에는 배정하지 않음.
 */
export function assignRoles(team: Player[]): Record<Role, Player> {
  if (team.length !== 5) {
    throw new Error('팀은 5명이어야 합니다.');
  }
  const shuffled = shuffle(team);
  const result = {} as Record<Role, Player>;
  const assignedRoles = new Set<Role>();

  for (const p of shuffled) {
    const banned = p.bannedRoles ?? [];
    const available = ROLES.filter((r) => !assignedRoles.has(r) && !banned.includes(r));
    const role =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : ROLES.find((r) => !assignedRoles.has(r));
    if (role) {
      assignedRoles.add(role);
      result[role] = p;
    }
  }

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

  const isBanned = (p: Player, r: Role) => (p.bannedRoles ?? []).includes(r);

  for (const role of ROLES) {
    const candidates = (byRole.get(role)?.filter((x) => !assigned.has(x.player.id)) ?? []).filter(
      (x) => !isBanned(x.player, role),
    );
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

  for (const role of leftRoles) {
    const eligible = leftShuffled.filter((p) => !assigned.has(p.id) && !isBanned(p, role));
    const player = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : leftShuffled.find((p) => !assigned.has(p.id));
    if (player) {
      result[role] = player;
      assigned.add(player.id);
    }
  }

  return result;
}
