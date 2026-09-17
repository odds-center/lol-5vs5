/** 여러 컴포넌트에서 공유하는 LoL 테마 Tailwind 클래스. 사용처에서 cn()으로 덮어쓴다. */

export const inputClass =
  'rounded-md border border-lol-border bg-lol-bg-card px-3 py-2 text-base text-lol-gold-bright outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-lol-muted/70 focus:border-lol-gold/60 focus:ring-1 focus:ring-lol-gold/30';

export const buttonPrimaryClass =
  'cursor-pointer border border-lol-gold/50 bg-lol-gold/20 px-5 py-2.5 text-lol-gold disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-lol-gold enabled:hover:bg-lol-gold/30 enabled:hover:shadow-[0_0_12px_rgba(200,170,110,0.25)]';

export const buttonSecondaryClass =
  'cursor-pointer border border-lol-border bg-lol-card px-4 py-2 text-lol-muted hover:border-lol-gold/50 hover:text-lol-gold';
