import type { GameBans, LinkedPairs, Player, SeriesBans, TeamAssignment } from '@/types';

const EMPTY_SLOT: Omit<Player, 'id'> = { name: '', mmr: 1000, rolePreference: '' };

const PLAYERS_KEY = 'lol-5vs5-players';
const ASSIGNMENT_KEY = 'lol-5vs5-last-assignment';
const SERIES_BANS_KEY = 'lol-5vs5-series-bans';
const LINKED_PAIRS_KEY = 'lol-5vs5-linked-pairs';
/** 닉네임 → 마지막 MMR. 디스코드에서 이름만 불러왔을 때 MMR을 복원하는 데 쓴다 */
const MMR_BY_NAME_KEY = 'lol-5vs5-mmr-by-name';

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
    // MMR_BY_NAME_KEY는 일부러 남긴다 — 닉네임별 MMR 기록은 명단을 비워도 다음 내전에서 재사용한다
  } catch {
    // ignore
  }
}

function isValidGameBans(x: unknown): x is GameBans {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    Array.isArray(o.blueBans) &&
    o.blueBans.every((s) => typeof s === 'string') &&
    Array.isArray(o.redBans) &&
    o.redBans.every((s) => typeof s === 'string')
  );
}

/** 시리즈 밴 목록 (경기별 블루 5 + 레드 5). 구 형식(string[]) 마이그레이션 지원 */
export function getSeriesBans(): SeriesBans {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(SERIES_BANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every(isValidGameBans)) return parsed as SeriesBans;
    // 구 형식: string[] → 1경기에 블루 5 + 레드 5로 분배
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      const names = parsed as string[];
      const blue = names.slice(0, 5);
      const red = names.slice(5, 10);
      return [{ blueBans: blue, redBans: red }];
    }
    return [];
  } catch {
    return [];
  }
}

export function setSeriesBans(bans: SeriesBans): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(SERIES_BANS_KEY, JSON.stringify(bans));
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

/** 참가자 명단만 갈아끼울 때처럼, 팀 결과만 버려야 하는 경우 */
export function clearLastAssignment(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(ASSIGNMENT_KEY);
  } catch {
    // ignore
  }
}

/** 대소문자·앞뒤 공백 차이로 같은 사람을 놓치지 않도록 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** 닉네임 → 마지막으로 입력된 MMR */
export function getMmrByName(): Record<string, number> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(MMR_BY_NAME_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [name, mmr] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof mmr === 'number' && Number.isFinite(mmr) && mmr >= 0) out[name] = mmr;
    }
    return out;
  } catch {
    return {};
  }
}

/** 기록된 MMR 조회. 없으면 null (호출부에서 기본값을 정한다) */
export function lookupMmr(name: string): number | null {
  const key = normalizeName(name);
  if (!key) return null;
  const mmr = getMmrByName()[key];
  return typeof mmr === 'number' ? mmr : null;
}

/**
 * 닉네임별 MMR 기록.
 * 입력 중(키 입력마다)이 아니라 팀 나누기처럼 명단이 확정된 시점에만 부른다 —
 * 그래야 "김", "김철", "김철수" 같은 중간 입력이 기록에 남지 않는다.
 */
export function rememberMmrForPlayers(players: Player[]): void {
  if (!isClient()) return;
  const next = getMmrByName();
  let changed = false;
  for (const player of players) {
    const key = normalizeName(player.name);
    if (!key || Number.isNaN(player.mmr) || player.mmr < 0) continue;
    if (next[key] !== player.mmr) {
      next[key] = player.mmr;
      changed = true;
    }
  }
  if (!changed) return;
  try {
    localStorage.setItem(MMR_BY_NAME_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
