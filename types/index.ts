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
  /** 배정 시 제외할 포지션 (이 라인에는 절대 배정되지 않음) */
  bannedRoles?: Role[];
  createdAt?: number;
}

export interface TeamAssignment {
  teamA: Player[];
  teamB: Player[];
  rolesA: Record<Role, Player>;
  rolesB: Record<Role, Player>;
  createdAt: number;
}

/** 한 경기당 블루팀 5밴, 레드팀 5밴 */
export interface GameBans {
  blueBans: string[];
  redBans: string[];
}

/** 시리즈 전체 밴: 1경기, 2경기, … 순서 */
export type SeriesBans = GameBans[];

/** 반드시 같은 팀에 넣을 참가자 쌍 (player id 2개). [id1, id2] 순서 무관 */
export type LinkedPairs = [string, string][];
