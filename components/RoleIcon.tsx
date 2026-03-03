'use client';

import Image from 'next/image';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

const ROLE_ICON_PATHS: Record<Role, string> = {
  top: '/roles/top.svg',
  jungle: '/roles/jungle.svg',
  mid: '/roles/mid.svg',
  adc: '/roles/bottom.svg',
  support: '/roles/support.svg',
};

interface RoleIconProps {
  role: Role;
  size?: number;
  className?: string;
}

export default function RoleIcon({ role, size = 24, className = '' }: RoleIconProps) {
  const src = ROLE_ICON_PATHS[role];
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn('inline-block shrink-0', className)}
      aria-hidden
      unoptimized
    />
  );
}

export { ROLE_ICON_PATHS };
