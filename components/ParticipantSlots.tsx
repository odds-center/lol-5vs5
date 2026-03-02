'use client';

import type { Player, RolePreference } from '@/types';
import { ROLES, ROLE_LABELS, type Role } from '@/types';
import RoleIcon from './RoleIcon';

const ROLE_OPTIONS: RolePreference[] = ['', ...ROLES];
const MAX_PER_ROLE = 2;

/** 역할별 선택 인원 수 (해당 슬롯 제외 시 비활성화 판단용) */
function countRoleExcept(slots: Player[], role: Role, exceptIndex: number): number {
  return slots.filter((s, i) => i !== exceptIndex && (s.rolePreference ?? '') === role).length;
}

/** 역할이 꽉 찼을 때, 그 역할을 가진 다른 한 명을 미정으로 바꿀 때 사용 */
export type SlotChangeBump = { index: number; rolePreference: '' };

interface ParticipantSlotsProps {
  slots: Player[];
  onChange: (
    index: number,
    name: string,
    mmr: number,
    rolePreference: RolePreference,
    bump?: SlotChangeBump,
  ) => void;
}

export default function ParticipantSlots({ slots, onChange }: ParticipantSlotsProps) {
  return (
    <div className='overflow-x-auto rounded border border-lol-border bg-lol-bg-card/80'>
      <table className='w-full min-w-[420px] border-collapse whitespace-nowrap text-base'>
        <thead>
          <tr className='border-b border-lol-border bg-lol-card/60'>
            <th className='whitespace-nowrap py-3 pl-4 pr-2 text-left font-cinzel text-base font-semibold uppercase tracking-[0.12em] text-lol-gold'>
              #
            </th>
            <th className='whitespace-nowrap py-3 px-2 text-left font-cinzel text-base font-semibold uppercase tracking-[0.12em] text-lol-gold'>
              닉네임
            </th>
            <th className='whitespace-nowrap py-3 px-2 text-left font-cinzel text-base font-semibold uppercase tracking-[0.12em] text-lol-gold'>
              MMR
            </th>
            <th className='whitespace-nowrap py-3 pl-2 pr-4 text-left font-cinzel text-base font-semibold uppercase tracking-[0.12em] text-lol-gold'>
              역할군
            </th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, i) => (
            <tr key={slot.id} className='border-b border-lol-border/60 last:border-b-0'>
              <td className='lol-desc whitespace-nowrap py-2.5 pl-4 pr-2 text-lol-muted'>참가자 {i + 1}</td>
              <td className='whitespace-nowrap py-2.5 px-2'>
                <input
                  type='text'
                  value={slot.name}
                  onChange={(e) => onChange(i, e.target.value, slot.mmr, slot.rolePreference ?? '')}
                  placeholder='닉네임'
                  className='lol-input w-full min-w-[72px]'
                />
              </td>
              <td className='whitespace-nowrap py-2.5 px-2'>
                <input
                  type='text'
                  inputMode='text'
                  value={slot.mmr || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    const mmr = v === '' ? 0 : parseInt(v, 10);
                    onChange(i, slot.name, Number.isNaN(mmr) ? 0 : mmr, slot.rolePreference ?? '');
                  }}
                  placeholder='MMR'
                  className='lol-input min-w-[8rem] w-[8rem]'
                />
              </td>
              <td className='whitespace-nowrap py-2.5 pl-2 pr-4'>
                <div className='flex items-center gap-2'>
                  {(slot.rolePreference ?? '') !== '' && (
                    <RoleIcon role={slot.rolePreference as Role} size={18} />
                  )}
                  <select
                    value={slot.rolePreference ?? ''}
                    onChange={(e) => {
                      const newRole = (e.target.value || '') as RolePreference;
                      if (
                        newRole !== '' &&
                        countRoleExcept(slots, newRole as Role, i) >= MAX_PER_ROLE
                      ) {
                        const bumpedIndex = slots.findIndex(
                          (s, j) => j !== i && (s.rolePreference ?? '') === newRole,
                        );
                        if (bumpedIndex !== -1) {
                          onChange(i, slot.name, slot.mmr, newRole, {
                            index: bumpedIndex,
                            rolePreference: '',
                          });
                          return;
                        }
                      }
                      onChange(i, slot.name, slot.mmr, newRole);
                    }}
                    className='lol-input w-[5rem] min-w-0 cursor-pointer'
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r || 'none'} value={r}>
                        {r === '' ? '미정' : ROLE_LABELS[r as Role]}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
