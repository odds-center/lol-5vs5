import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부·병합 클래스명. Tailwind 충돌 시 나중 값 우선. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
