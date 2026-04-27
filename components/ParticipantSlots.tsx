'use client';

import type { Player, RolePreference } from '@/types';
import { ROLES, type Role } from '@/types';
import RoleIcon from './RoleIcon';
import RoleDropdown from './RoleDropdown';
import { useTranslation } from '@/components/LanguageProvider';

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
    bannedRoles?: Role[],
  ) => void;
}

export default function ParticipantSlots({ slots, onChange }: ParticipantSlotsProps) {
  const { t, roleLabels } = useTranslation();
  return (
    <div className='overflow-x-auto rounded-xl border border-lol-border bg-lol-bg-card/80 shadow-inner'>
      <table className='w-full min-w-[640px] border-collapse whitespace-nowrap text-base'>
        <thead>
          <tr className='border-b border-lol-border bg-gradient-to-r from-lol-card/90 to-lol-bg-card/90'>
            <th className='whitespace-nowrap py-2 pl-3 pr-1.5 text-left font-cinzel text-sm font-semibold uppercase tracking-[0.15em] text-lol-gold'>
              {t('colNumber')}
            </th>
            <th className='whitespace-nowrap py-2 px-1.5 text-left font-cinzel text-sm font-semibold uppercase tracking-[0.15em] text-lol-gold'>
              {t('nickname')}
            </th>
            <th className='whitespace-nowrap py-2 px-1.5 text-left font-cinzel text-sm font-semibold uppercase tracking-[0.15em] text-lol-gold'>
              MMR
            </th>
            <th className='whitespace-nowrap py-2 pl-1.5 pr-1.5 text-left font-cinzel text-sm font-semibold uppercase tracking-[0.15em] text-lol-gold'>
              {t('role')}
            </th>
            <th className='whitespace-nowrap py-2 pl-1.5 pr-3 text-left font-cinzel text-sm font-semibold uppercase tracking-[0.15em] text-lol-gold'>
              {t('positionBan')}
            </th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, i) => (
            <tr
              key={slot.id}
              className='border-b border-lol-border/50 transition-colors last:border-b-0 hover:bg-lol-card/30'
            >
              <td className='lol-desc whitespace-nowrap py-1.5 pl-3 pr-1.5'>
                <span className='inline-flex h-6 min-w-[2rem] items-center justify-center rounded-md bg-lol-card/80 px-1.5 text-center text-sm text-lol-muted'>
                  {i + 1}
                </span>
              </td>
              <td className='whitespace-nowrap py-1.5 px-1.5'>
                <input
                  type='text'
                  value={slot.name}
                  onChange={(e) =>
                    onChange(
                      i,
                      e.target.value,
                      slot.mmr,
                      slot.rolePreference ?? '',
                      undefined,
                      slot.bannedRoles,
                    )
                  }
                  tabIndex={i + 1}
                  placeholder={t('placeholderNickname')}
                  className='lol-input w-full min-w-[5rem] max-w-[140px] rounded-lg'
                />
              </td>
              <td className='whitespace-nowrap py-1.5 px-1.5'>
                <input
                  type='text'
                  inputMode='text'
                  value={slot.mmr || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    const mmr = v === '' ? 0 : parseInt(v, 10);
                    onChange(
                      i,
                      slot.name,
                      Number.isNaN(mmr) ? 0 : mmr,
                      slot.rolePreference ?? '',
                      undefined,
                      slot.bannedRoles,
                    );
                  }}
                  tabIndex={i + 11}
                  placeholder={t('placeholderMmr')}
                  className='lol-input min-w-[8rem] w-[8rem] rounded-lg'
                />
              </td>
              <td className='whitespace-nowrap py-1.5 pl-1.5 pr-2'>
                <RoleDropdown
                  value={slot.rolePreference ?? ''}
                  onChange={(newRole) => {
                    if (
                      newRole !== '' &&
                      countRoleExcept(slots, newRole as Role, i) >= MAX_PER_ROLE
                    ) {
                      const bumpedIndex = slots.findIndex(
                        (s, j) => j !== i && (s.rolePreference ?? '') === newRole,
                      );
                      if (bumpedIndex !== -1) {
                        onChange(
                          i,
                          slot.name,
                          slot.mmr,
                          newRole,
                          {
                            index: bumpedIndex,
                            rolePreference: '',
                          },
                          slot.bannedRoles,
                        );
                        return;
                      }
                    }
                    onChange(i, slot.name, slot.mmr, newRole, undefined, slot.bannedRoles);
                  }}
                  isOptionDisabled={(role) => countRoleExcept(slots, role, i) >= MAX_PER_ROLE}
                  placeholder={t('roleUnset')}
                />
              </td>
              <td className='whitespace-nowrap py-1.5 pl-1.5 pr-3'>
                <div className='grid grid-cols-5 gap-x-2 gap-y-1'>
                  {(ROLES as Role[]).map((role) => {
                    const banned = (slot.bannedRoles ?? []).includes(role);
                    return (
                      <label
                        key={role}
                        className='lol-desc flex cursor-pointer items-center gap-2 rounded px-1.5 py-0.5 text-lol-muted transition-colors hover:bg-lol-card/40 hover:text-lol-gold-bright'
                      >
                        <span className='relative flex h-4 w-4 shrink-0'>
                          <input
                            type='checkbox'
                            checked={banned}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...(slot.bannedRoles ?? []), role]
                                : (slot.bannedRoles ?? []).filter((r) => r !== role);
                              onChange(
                                i,
                                slot.name,
                                slot.mmr,
                                slot.rolePreference ?? '',
                                undefined,
                                next,
                              );
                            }}
                            className='peer sr-only'
                          />
                          <span className='block h-4 w-4 rounded border border-lol-border bg-lol-bg-card transition-all peer-checked:border-lol-gold peer-checked:bg-lol-gold peer-checked:ring-1 peer-checked:ring-lol-gold/50' />
                          <span className='pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-lol-bg opacity-0 peer-checked:opacity-100'>
                            ✓
                          </span>
                        </span>
                        <span>{roleLabels[role]} {t('roleBan')}</span>
                      </label>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
