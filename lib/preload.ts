/** 챔피언 이미지 미리 로드 (브라우저 캐시에 올림) */
export function preloadChampionImage(name: string): void {
  if (typeof window === 'undefined') return;
  const src = `/champion/${encodeURIComponent(name)}.webp`;
  const img = new window.Image();
  img.src = src;
}

/** 여러 챔피언 이미지를 순차/배치로 미리 로드 */
export function preloadChampionImages(names: string[], limit = 50): void {
  names.slice(0, limit).forEach(preloadChampionImage);
}
