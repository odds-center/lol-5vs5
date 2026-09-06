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

/** 미리 정해진 팀 고정. 'A' = 1팀(블루), 'B' = 2팀(레드), '' = 미정 */
export type FixedTeam = 'A' | 'B' | '';

export interface Player {
  id: string;
  name: string;
  mmr: number;
  /** 선호 역할 (빈 문자열 = 미정) */
  rolePreference?: RolePreference;
  /** 배정 시 제외할 포지션 (이 라인에는 절대 배정되지 않음) */
  bannedRoles?: Role[];
  /** 팀이 미리 정해진 경우 고정할 팀 (없으면 자동 분배) */
  fixedTeam?: FixedTeam;
  createdAt?: number;
}

export interface TeamAssignment {
  teamA: Player[];
  teamB: Player[];
  rolesA: Record<Role, Player>;
  rolesB: Record<Role, Player>;
  createdAt: number;
}

export type TeamKind = 'blue' | 'red';

/** 한 경기의 밴·픽 기록. 각 배열은 5칸 (빈 칸은 '') */
export interface GameDraft {
  blueBans: string[];
  redBans: string[];
  bluePicks: string[];
  redPicks: string[];
}

/** 시리즈 전체 밴픽: 1경기, 2경기, … 순서 */
export type SeriesDraft = GameDraft[];

/**
 * 피어리스 규칙.
 * - off:  사용 안 함
 * - half: 하프 피어리스 — 자기 팀이 이전 경기에서 픽한 챔피언만 잠김
 * - full: 풀 피어리스 — 양 팀이 이전 경기에서 픽한 챔피언 전부 잠김
 */
export type FearlessMode = 'off' | 'half' | 'full';

export const FEARLESS_MODES: FearlessMode[] = ['off', 'half', 'full'];

/** 반드시 같은 팀에 넣을 참가자 쌍 (player id 2개). [id1, id2] 순서 무관 */
export type LinkedPairs = [string, string][];
