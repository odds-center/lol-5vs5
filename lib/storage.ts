import type { Player, TeamAssignment } from '@/types';

const EMPTY_SLOT: Omit<Player, 'id'> = { name: '', mmr: 1000, rolePreference: '' };

const PLAYERS_KEY = 'lol-5vs5-players';
const ASSIGNMENT_KEY = 'lol-5vs5-last-assignment';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

const SLOT_IDS = [
  'slot-0',
  'slot-1',
  'slot-2',
  'slot-3',
  'slot-4',
  'slot-5',
  'slot-6',
  'slot-7',
  'slot-8',
  'slot-9',
] as const;

/** 항상 10개 슬롯으로 반환 (부족하면 빈 슬롯으로 채움). 기존 데이터는 앞에서부터 슬롯에 매핑 */
export function getPlayers(): Player[] {
  if (!isClient()) return defaultSlots();
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return defaultSlots();
    const parsed = JSON.parse(raw) as Player[];
    if (!Array.isArray(parsed)) return defaultSlots();
    const byId = new Map(parsed.map((p) => [p.id, p]));
    const hasSlots = SLOT_IDS.some((id) => byId.has(id));
    if (hasSlots) {
      return SLOT_IDS.map((id) => byId.get(id) ?? { id, ...EMPTY_SLOT });
    }
    const migrated: Player[] = SLOT_IDS.map((id, i) => {
      const p = parsed[i];
      if (p && typeof p.name === 'string' && typeof p.mmr === 'number')
        return { ...EMPTY_SLOT, ...p, id };
      return { id, ...EMPTY_SLOT };
    });
    return migrated;
  } catch {
    return defaultSlots();
  }
}

function defaultSlots(): Player[] {
  return SLOT_IDS.map((id) => ({ id, ...EMPTY_SLOT }));
}

/** 초기 상태: 빈 10슬롯. 완전 초기화 시 사용 */
export function getDefaultPlayers(): Player[] {
  return defaultSlots();
}

/** localStorage의 참가자·배정 결과 전부 삭제 (완전 초기화용) */
export function clearAllStorage(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(PLAYERS_KEY);
    localStorage.removeItem(ASSIGNMENT_KEY);
  } catch {
    // ignore
  }
}

export function setPlayers(players: Player[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  } catch {
    // ignore
  }
}

export function getLastAssignment(): TeamAssignment | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(ASSIGNMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeamAssignment;
  } catch {
    return null;
  }
}

export function setLastAssignment(assignment: TeamAssignment): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(assignment));
  } catch {
    // ignore
  }
}
