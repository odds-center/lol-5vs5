/**
 * 디스코드 봇 초대 링크.
 *
 * 봇 코드는 별도 레포(lol-5vs5-bot)에 있고 Railway 같은 상시 실행 환경에 배포한다.
 * 사이트는 "서버에 봇 추가" 링크만 제공한다.
 */

/**
 * 봇 애플리케이션 ID. 빌드 시점에 인라인되므로 반드시 정적으로 참조해야 한다.
 * 비어 있으면 초대 버튼을 숨긴다 — 앱을 아직 안 만들었어도 사이트는 정상 동작한다.
 */
const APP_ID = process.env.NEXT_PUBLIC_DISCORD_APP_ID?.trim() ?? '';

/** View Channels(1 << 10)만 필요하다. 음성 채널 접속(Connect) 권한은 쓰지 않는다 */
const PERMISSIONS = String(1 << 10);

/** 초대 URL. 앱 ID가 설정되지 않았으면 null */
export function getBotInviteUrl(): string | null {
  if (!APP_ID) return null;
  const params = new URLSearchParams({
    client_id: APP_ID,
    permissions: PERMISSIONS,
    scope: 'bot applications.commands',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
