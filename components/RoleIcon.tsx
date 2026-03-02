'use client';

import type { Role } from '@/types';

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
    <img
      src={src}
      alt=''
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    />
  );
}

export { ROLE_ICON_PATHS };
