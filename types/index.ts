export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export const ROLES: Role[] = ['top', 'jungle', 'mid', 'adc', 'support'];

export const ROLE_LABELS: Record<Role, string> = {
  top: '탑',
  jungle: '정글',
  mid: '미드',
  adc: '원딜',
  support: '서폿',
};

export type RolePreference = Role | '';

export interface Player {
  id: string;
  name: string;
  mmr: number;
  /** 선호 역할 (빈 문자열 = 미정) */
  rolePreference?: RolePreference;
  createdAt?: number;
}

export interface TeamAssignment {
  teamA: Player[];
  teamB: Player[];
  rolesA: Record<Role, Player>;
  rolesB: Record<Role, Player>;
  createdAt: number;
}
