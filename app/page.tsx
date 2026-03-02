'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import type { Player, RolePreference, TeamAssignment } from '@/types';
import {
  getPlayers,
  setPlayers,
  getLastAssignment,
  setLastAssignment,
  getDefaultPlayers,
  clearAllStorage,
} from '@/lib/storage';
import { divideTeams, divideTeamsRandom } from '@/lib/teamAlgorithm';
import { assignRoles, assignRolesWithPreferences } from '@/lib/roleAssignment';
import ParticipantSlots from '@/components/ParticipantSlots';
import TeamDivisionResult from '@/components/TeamDivisionResult';

type TabId = 'participants' | 'result';

function createEmptyAssignment(teamA: Player[], teamB: Player[]): TeamAssignment {
  const hasPreference = (team: Player[]) => team.some((p) => (p.rolePreference ?? '') !== '');
  const rolesA = hasPreference(teamA) ? assignRolesWithPreferences(teamA) : assignRoles(teamA);
  const rolesB = hasPreference(teamB) ? assignRolesWithPreferences(teamB) : assignRoles(teamB);
  return {
    teamA,
    teamB,
    rolesA,
    rolesB,
    createdAt: Date.now(),
  };
}

function validPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.name.trim() !== '' && !Number.isNaN(p.mmr) && p.mmr >= 0);
}

export default function Home() {
  const [players, setPlayersState] = useState<Player[]>([]);
  const [assignment, setAssignment] = useState<TeamAssignment | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('participants');

  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    const loadedPlayers = getPlayers();
    const loadedAssignment = getLastAssignment();
    console.log('[관악구 피바라기] 마운트: localStorage에서 로드', {
      playersCount: loadedPlayers.length,
      hasAssignment: !!loadedAssignment,
      assignmentCreatedAt: loadedAssignment?.createdAt,
    });
    setPlayersState(loadedPlayers);
    setAssignment(loadedAssignment);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    console.log(
      '[관악구 피바라기] assignment 상태 변경:',
      assignment ? `createdAt=${assignment.createdAt}` : 'null',
    );
  }, [assignment, mounted]);

  const persistPlayers = useCallback((next: Player[]) => {
    setPlayersState(next);
    setPlayers(next);
  }, []);

  const persistAssignment = useCallback((next: TeamAssignment | null) => {
    setAssignment(next);
    if (next) setLastAssignment(next);
  }, []);

  /** bump: 역할이 꽉 찼을 때, 해당 역할을 가진 다른 한 명의 역할을 ''로 바꿈 */
  const handleSlotChange = useCallback(
    (
      index: number,
      name: string,
      mmr: number,
      rolePreference: RolePreference,
      bump?: { index: number; rolePreference: '' },
    ) => {
      const next = [...players];
      const pref: RolePreference | undefined = rolePreference || undefined;
      next[index] = { ...next[index], name, mmr, rolePreference: pref };
      if (bump) {
        next[bump.index] = { ...next[bump.index], rolePreference: bump.rolePreference ?? undefined };
      }
      persistPlayers(next);
      if (assignment) {
        const id = next[index].id;
        const patch = { name, mmr, rolePreference: pref };
        const bumpId = bump ? next[bump.index].id : null;
        const bumpPatch = bump ? { rolePreference: '' as RolePreference } : null;
        const updateInTeam = (team: Player[], pid: string, p: Partial<Player>) =>
          team.map((pl) => (pl.id === pid ? { ...pl, ...p } : pl));
        let teamA = updateInTeam(assignment.teamA, id, patch);
        let teamB = updateInTeam(assignment.teamB, id, patch);
        if (bumpId && bumpPatch) {
          teamA = updateInTeam(teamA, bumpId, bumpPatch);
          teamB = updateInTeam(teamB, bumpId, bumpPatch);
        }
        const patchRoleEntry = (roles: TeamAssignment['rolesA']) =>
          Object.fromEntries(
            Object.entries(roles).map(([r, p]) => [
              r,
              p.id === id ? { ...p, ...patch } : bumpId && p.id === bumpId ? { ...p, ...bumpPatch } : p,
            ]),
          ) as TeamAssignment['rolesA'];
        const nextAssignment: TeamAssignment = {
          ...assignment,
          teamA,
          teamB,
          rolesA: patchRoleEntry(assignment.rolesA),
          rolesB: patchRoleEntry(assignment.rolesB),
        };
        persistAssignment(nextAssignment);
      }
    },
    [players, assignment, persistPlayers, persistAssignment],
  );

  const handleDivideTeams = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 팀 나누기');
    const valid = validPlayers(players);
    console.log('[관악구 피바라기] 유효 참가자 수:', valid.length, '/ 10');
    if (valid.length !== 10) {
      console.log('[관악구 피바라기] 팀 나누기 중단: 10명 아님');
      return;
    }
    try {
      const { teamA, teamB } = divideTeams(valid);
      const next = createEmptyAssignment(teamA, teamB);
      console.log('[관악구 피바라기] 팀 나누기 결과 생성됨, createdAt:', next.createdAt);
      persistAssignment(next);
      setActiveTab('result');
      console.log('[관악구 피바라기] 팀 나누기 완료, 결과 탭으로 이동');
    } catch (e) {
      console.error('[관악구 피바라기] 팀 나누기 예외:', e);
      alert('팀 나누기 실패. 10명 모두 이름과 MMR을 입력했는지 확인하세요.');
    }
  }, [players, persistAssignment]);

  const handleAssignRoles = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 역할 랜덤 배정 / 역할만 다시 랜덤');
    console.log(
      '[관악구 피바라기] 현재 assignment:',
      assignment ? '있음' : 'null',
      assignment ? `(createdAt: ${assignment.createdAt})` : '',
    );
    if (!assignment || assignment.teamA.length !== 5 || assignment.teamB.length !== 5) {
      console.log('[관악구 피바라기] 역할 배정 중단: assignment 없음 또는 팀 5명 아님');
      return;
    }
    // 팀 내부에서만 완전 랜덤 배정 (선호 역할 무시)
    const rolesA = assignRoles([...assignment.teamA]);
    const rolesB = assignRoles([...assignment.teamB]);
    const next: TeamAssignment = {
      teamA: [...assignment.teamA],
      teamB: [...assignment.teamB],
      rolesA,
      rolesB,
      createdAt: Date.now(),
    };
    console.log(
      '[관악구 피바라기] 새 역할 배정 생성됨, createdAt:',
      next.createdAt,
      'rolesA:',
      Object.keys(rolesA),
      'rolesB:',
      Object.keys(rolesB),
    );
    flushSync(() => setAssignment(next));
    console.log('[관악구 피바라기] flushSync setAssignment(next) 완료');
    setLastAssignment(next);
    console.log('[관악구 피바라기] setLastAssignment(next) 완료');
  }, [assignment]);

  /** 완전 초기화: localStorage 삭제, 참가자 10슬롯 비우기, 배정 결과 제거, 참가자 탭으로 */
  const handleFullReset = useCallback(() => {
    if (!window.confirm('모든 참가자와 팀 결과가 삭제됩니다. 정말 초기화할까요?')) return;
    console.log('[관악구 피바라기] 완전 초기화');
    clearAllStorage();
    const empty = getDefaultPlayers();
    setPlayersState(empty);
    setPlayers(empty);
    setAssignment(null);
    setActiveTab('participants');
  }, []);

  /** 참가자 명단(10명)을 랜덤 셔플해 1팀·2팀 재구성. 누를 때마다 다른 조합 */
  const handleRedivide = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 다시 나누기');
    const currentPlayers = playersRef.current;
    const valid = validPlayers(currentPlayers);
    console.log('[관악구 피바라기] 참가자 명단 기준 유효 인원:', valid.length, '/ 10');
    if (valid.length !== 10) {
      console.log('[관악구 피바라기] 다시 나누기 중단: 참가자 10명 미만');
      return;
    }
    try {
      const { teamA, teamB } = divideTeamsRandom(valid);
      const next = createEmptyAssignment(teamA, teamB);
      console.log('[관악구 피바라기] 다시 나누기 결과 생성됨, createdAt:', next.createdAt);
      flushSync(() => setAssignment(next));
      setLastAssignment(next);
      console.log('[관악구 피바라기] 다시 나누기 완료 (랜덤 1팀·2팀)');
    } catch (e) {
      console.error('[관악구 피바라기] 다시 나누기 예외:', e);
    }
  }, []);

  if (!mounted) {
    return (
      <div className='relative z-10 flex min-h-screen items-center justify-center font-cinzel text-lol-gold'>
        로딩 중...
      </div>
    );
  }

  const valid = validPlayers(players);
  const canDivide = valid.length === 10;
  const hasAssignment = assignment !== null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'participants', label: '참가자' },
    { id: 'result', label: '결과' },
  ];

  return (
    <main className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
      <div className='lol-panel w-full max-w-2xl'>
        <header className='lol-panel-header px-4 py-5 text-center sm:px-6 sm:py-6'>
          <h1 className='font-cinzel text-xl font-bold uppercase tracking-[0.2em] text-lol-gold sm:text-2xl'>
            LoL 5vs5 내전
          </h1>
          <p className='lol-desc mt-2 tracking-wide text-lol-muted'>
            관악구 피바라기 · MMR 밸런스 팀 분배 · 역할 랜덤 배정
          </p>
        </header>

        <div
          className='flex border-b border-lol-border bg-lol-bg-card/60'
          role='tablist'
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              role='tab'
              aria-selected={activeTab === id}
              onClick={() => {
                console.log('[관악구 피바라기] 탭 클릭:', id);
                setActiveTab(id);
              }}
              className={`min-w-[5rem] flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors sm:py-3.5 sm:text-base ${
                activeTab === id
                  ? 'border-b-2 border-lol-gold bg-lol-card/80 text-lol-gold -mb-px'
                  : 'text-lol-muted hover:text-lol-gold-bright'
              }`}
            >
              {label}
              {id === 'participants' && (
                <span className='lol-desc ml-1.5 font-normal text-lol-muted'>({valid.length}/10)</span>
              )}
            </button>
          ))}
        </div>

        <div className='min-h-[320px] overflow-auto px-4 py-5 sm:px-6 sm:py-6'>
          {activeTab === 'participants' && (
            <div className='flex flex-col gap-5'>
              <ParticipantSlots slots={players} onChange={handleSlotChange} />
              {valid.length > 0 && valid.length < 10 && (
                <p className='lol-desc text-center text-amber-400/90'>
                  팀 나누기를 하려면 10명 모두 이름과 MMR을 입력하세요.
                </p>
              )}
              <div className='flex flex-wrap justify-center gap-3 pt-1'>
                <button
                  type='button'
                  onClick={() => {
                    console.log('[관악구 피바라기] 버튼 클릭: 팀 나누기 (참가자 탭)');
                    handleDivideTeams();
                  }}
                  disabled={!canDivide}
                  className='lol-btn-primary min-w-[140px] py-3'
                >
                  팀 나누기
                </button>
                <button
                  type='button'
                  onClick={handleFullReset}
                  className='lol-btn-secondary min-w-[120px] py-3'
                  title='참가자·팀 결과 전부 삭제 후 처음부터'
                >
                  완전 초기화
                </button>
              </div>
            </div>
          )}

          {activeTab === 'result' && (
            <div className='flex flex-col gap-5'>
              {hasAssignment ? (
                <>
                  <TeamDivisionResult
                    key={assignment.createdAt}
                    assignment={assignment}
                    showRoles={!!assignment}
                  />
                  <div className='lol-divider my-1' />
                  <div className='flex flex-wrap justify-center gap-3'>
                    <button
                      type='button'
                      title='참가자 명단(10명)을 랜덤으로 다시 섞어 1팀·2팀으로 나눕니다'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 다시 나누기');
                        handleRedivide();
                      }}
                      className='lol-btn-secondary min-w-[120px] py-2.5'
                    >
                      다시 나누기
                    </button>
                    <button
                      type='button'
                      title='팀 내에서 역할을 랜덤 배정합니다'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 역할 랜덤 배정');
                        handleAssignRoles();
                      }}
                      className='lol-btn-primary min-w-[140px] py-2.5'
                    >
                      역할 랜덤 배정
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 참가자 수정');
                        setActiveTab('participants');
                      }}
                      className='lol-btn-secondary min-w-[120px] py-2.5'
                    >
                      참가자 수정
                    </button>
                    <button
                      type='button'
                      onClick={handleFullReset}
                      className='lol-btn-secondary min-w-[120px] py-2.5'
                      title='참가자·팀 결과 전부 삭제 후 처음부터'
                    >
                      완전 초기화
                    </button>
                  </div>
                </>
              ) : (
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                  <p className='mb-4 text-lol-muted'>아직 팀이 나뉘지 않았습니다.</p>
                  <button
                    type='button'
                    onClick={() => {
                      console.log('[관악구 피바라기] 버튼 클릭: 참가자 탭에서 팀 나누기');
                      setActiveTab('participants');
                    }}
                    className='lol-btn-primary min-w-[180px] py-3'
                  >
                    참가자 탭에서 팀 나누기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
