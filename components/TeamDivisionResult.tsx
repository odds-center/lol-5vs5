'use client';

import type { Player, TeamAssignment } from '@/types';
import { ROLE_LABELS, type Role } from '@/types';
import RoleIcon from './RoleIcon';

interface TeamDivisionResultProps {
  assignment: TeamAssignment | null;
  showRoles: boolean;
}

function teamMmr(team: Player[]): number {
  return team.reduce((sum, p) => sum + p.mmr, 0);
}

function TeamCard({
  title,
  team,
  roles,
  showRoles,
  teamColor,
}: {
  title: string;
  team: Player[];
  roles?: Record<Role, Player>;
  showRoles: boolean;
  teamColor: 'blue' | 'red';
}) {
  const mmr = teamMmr(team);
  const avg = team.length ? Math.round(mmr / team.length) : 0;
  const isBlue = teamColor === 'blue';

  return (
    <div
      className={`rounded border-2 ${isBlue ? 'border-lol-blue-border bg-lol-blue/50' : 'border-lol-red-border bg-lol-red/50'}`}
      style={{
        boxShadow: isBlue
          ? '0 0 0 1px rgba(14, 40, 66, 0.5) inset'
          : '0 0 0 1px rgba(74, 40, 32, 0.5) inset',
      }}
    >
      <div className='border-b border-lol-border bg-black/20 px-4 py-2.5'>
        <div className='flex items-center justify-between'>
          <h3 className='font-cinzel text-sm font-bold uppercase tracking-[0.15em] text-lol-gold'>
            {title}
          </h3>
          <span className='lol-desc text-lol-muted'>
            합계 {mmr} · 평균 {avg}
          </span>
        </div>
      </div>
      <div className='px-4 py-3'>
        {showRoles && roles ? (
          <ul className='space-y-2'>
            {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
              <li key={role} className='flex items-center justify-between gap-3 border-b border-lol-border/50 py-2 last:border-b-0 last:pb-0'>
                <span className='lol-desc flex items-center gap-2 text-lol-muted'>
                  <RoleIcon role={role} size={18} />
                  {label}
                </span>
                <span className='text-sm font-medium text-lol-gold-bright'>
                  {roles[role].name} <span className='text-lol-muted'>({roles[role].mmr})</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className='space-y-1.5'>
            {team.map((p) => (
              <li key={p.id} className='text-sm text-lol-gold-bright'>
                {p.name} <span className='text-lol-muted'>— MMR {p.mmr}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function TeamDivisionResult({ assignment, showRoles }: TeamDivisionResultProps) {
  if (!assignment) return null;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5'>
        <TeamCard
          title='팀 A'
          team={assignment.teamA}
          roles={assignment.rolesA}
          showRoles={showRoles}
          teamColor='blue'
        />
        <TeamCard
          title='팀 B'
          team={assignment.teamB}
          roles={assignment.rolesB}
          showRoles={showRoles}
          teamColor='red'
        />
      </div>
    </div>
  );
}
