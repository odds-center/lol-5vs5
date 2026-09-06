import type { FearlessMode, GameDraft, LinkedPairs, Player, SeriesDraft, TeamAssignment } from '@/types';
import { ensureFive, emptyGame } from '@/lib/fearless';

const EMPTY_SLOT: Omit<Player, 'id'> = { name: '', mmr: 1000, rolePreference: '' };

const PLAYERS_KEY = 'lol-5vs5-players';
const ASSIGNMENT_KEY = 'lol-5vs5-last-assignment';
const SERIES_BANS_KEY = 'lol-5vs5-series-bans';
const LINKED_PAIRS_KEY = 'lol-5vs5-linked-pairs';
const FEARLESS_MODE_KEY = 'lol-5vs5-fearless-mode';

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

/** localStorage의 참가자·배정 결과·밴 목록 전부 삭제 (완전 초기화용) */
export function clearAllStorage(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(PLAYERS_KEY);
    localStorage.removeItem(ASSIGNMENT_KEY);
    localStorage.removeItem(SERIES_BANS_KEY);
    localStorage.removeItem(LINKED_PAIRS_KEY);
    localStorage.removeItem(FEARLESS_MODE_KEY);
  } catch {
    // ignore
  }
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((s) => typeof s === 'string');
}

/** 구 형식({blueBans, redBans})은 빈 픽 배열을 채워 넣어 그대로 살림 */
function toGameDraft(x: unknown): GameDraft | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  if (!isStringArray(o.blueBans) || !isStringArray(o.redBans)) return null;
  return {
    blueBans: ensureFive(o.blueBans),
    redBans: ensureFive(o.redBans),
    bluePicks: ensureFive(isStringArray(o.bluePicks) ? o.bluePicks : []),
    redPicks: ensureFive(isStringArray(o.redPicks) ? o.redPicks : []),
  };
}

/** 시리즈 밴픽 (경기별 블루/레드 각 5밴 5픽). 구 형식 2종 마이그레이션 지원 */
export function getSeriesDraft(): SeriesDraft {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(SERIES_BANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // 최구 형식: string[] → 1경기에 블루 5밴 + 레드 5밴으로 분배
    if (isStringArray(parsed)) {
      return [{ ...emptyGame(), blueBans: ensureFive(parsed.slice(0, 5)), redBans: ensureFive(parsed.slice(5, 10)) }];
    }
    const games = parsed.map(toGameDraft);
    return games.every((g): g is GameDraft => g !== null) ? games : [];
  } catch {
    return [];
  }
}

export function setSeriesDraft(draft: SeriesDraft): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(SERIES_BANS_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function getFearlessMode(): FearlessMode {
  if (!isClient()) return 'off';
  try {
    const raw = localStorage.getItem(FEARLESS_MODE_KEY);
    return raw === 'half' || raw === 'full' ? raw : 'off';
  } catch {
    return 'off';
  }
}

export function setFearlessMode(mode: FearlessMode): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(FEARLESS_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function isValidLinkedPairs(x: unknown): x is LinkedPairs {
  if (!Array.isArray(x)) return false;
  return x.every(
    (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' && typeof p[1] === 'string',
  );
}

export function getLinkedPairs(): LinkedPairs {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(LINKED_PAIRS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return isValidLinkedPairs(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLinkedPairs(pairs: LinkedPairs): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(LINKED_PAIRS_KEY, JSON.stringify(pairs));
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
