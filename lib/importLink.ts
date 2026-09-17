/**
 * 디스코드 봇이 만든 `?import=` 링크 파싱.
 *
 * 형식: base64url(JSON.stringify({ v: 1, source: 'discord', names: [...] }))
 * 서버에는 아무것도 저장하지 않고, URL에 담긴 이름만 참가자 슬롯으로 옮긴다.
 * 전체 설계는 docs/DISCORD_BOT_PLAN.md 참고.
 */

export const IMPORT_PARAM = 'import';

/** 참가자 슬롯 수와 동일 */
export const MAX_IMPORT_NAMES = 10;

/** 닉네임 최대 길이 (디스코드 표시 이름 상한과 맞춤) */
const MAX_NAME_LENGTH = 32;

/** 지원하는 페이로드 버전. 형식이 바뀌면 올린다 */
const SUPPORTED_VERSION = 1;

interface ImportPayload {
  v: number;
  source?: string;
  names: string[];
}

function base64UrlToBytes(input: string): Uint8Array {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + '='.repeat(padding));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function isPayload(x: unknown): x is ImportPayload {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.v === 'number' &&
    Array.isArray(o.names) &&
    o.names.every((n) => typeof n === 'string')
  );
}

/**
 * `?import=` 값에서 참가자 이름 목록을 뽑는다.
 * 형식이 조금이라도 어긋나면 null — 링크는 외부 입력이므로 조용히 무시한다.
 */
export function decodeImportParam(raw: string): string[] | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(raw));
    const parsed = JSON.parse(json) as unknown;
    if (!isPayload(parsed) || parsed.v !== SUPPORTED_VERSION) return null;
    const names = parsed.names
      .map((name) => name.trim().slice(0, MAX_NAME_LENGTH))
      .filter((name) => name !== '')
      .slice(0, MAX_IMPORT_NAMES);
    return names.length > 0 ? names : null;
  } catch {
    return null;
  }
}

/** 봇·테스트에서 링크를 만들 때 사용 (사이트 자체는 쓰지 않음) */
export function encodeImportParam(names: string[]): string {
  const payload: ImportPayload = {
    v: SUPPORTED_VERSION,
    source: 'discord',
    names: names
      .map((name) => name.trim().slice(0, MAX_NAME_LENGTH))
      .filter((name) => name !== '')
      .slice(0, MAX_IMPORT_NAMES),
  };
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}
