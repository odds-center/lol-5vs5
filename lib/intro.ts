/** 첫 방문 인트로(문 열림)를 이미 봤는지 기록하는 localStorage 키 */
export const INTRO_SEEN_KEY = 'lol-5vs5-intro-seen';

/**
 * 페인트 전에 실행되어 첫 방문이면 html[data-intro]를 붙인다.
 * 서버 HTML의 닫힌 문은 이 속성이 있을 때만 보이므로 재방문자에게는 깜빡이지 않는다.
 * - 움직임 줄이기(prefers-reduced-motion) 설정이면 건너뜀
 * - `?intro` 쿼리로 다시 보기 가능
 */
export const INTRO_SCRIPT = `try{if(/[?&]intro(=|&|$)/.test(location.search)||(!localStorage.getItem('${INTRO_SEEN_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches))document.documentElement.setAttribute('data-intro','')}catch(e){}`;
