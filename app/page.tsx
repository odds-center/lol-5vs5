'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import type { LinkedPairs, Player, RolePreference, SeriesBans, TeamAssignment } from '@/types';
import type { Role } from '@/types';
import {
  getPlayers,
  setPlayers,
  getLastAssignment,
  setLastAssignment,
  getDefaultPlayers,
  clearAllStorage,
  getSeriesBans,
  setSeriesBans,
  getLinkedPairs,
  setLinkedPairs,
} from '@/lib/storage';
import { divideTeams, divideTeamsRandom } from '@/lib/teamAlgorithm';
import { assignRoles, assignRolesWithPreferences } from '@/lib/roleAssignment';
import { fillEmptyNames } from '@/lib/randomNames';
import LinkedPairsEditor from '@/components/LinkedPairsEditor';
import ParticipantSlots from '@/components/ParticipantSlots';
import SeriesBanList from '@/components/SeriesBanList';
import TeamDivisionResult from '@/components/TeamDivisionResult';

type TabId = 'participants' | 'result' | 'bans';

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

/** MMR만 유효한 슬롯 수 (이름 없어도 팀 나누기 버튼 허용용) */
function countValidMmr(players: Player[]): number {
  return players.filter((p) => !Number.isNaN(p.mmr) && p.mmr >= 0).length;
}

export default function Home() {
  const [players, setPlayersState] = useState<Player[]>([]);
  const [assignment, setAssignment] = useState<TeamAssignment | null>(null);
  const [seriesBans, setSeriesBansState] = useState<SeriesBans>([]);
  const [linkedPairs, setLinkedPairsState] = useState<LinkedPairs>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('participants');

  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    const loadedPlayers = getPlayers();
    const loadedAssignment = getLastAssignment();
    const loadedBans = getSeriesBans();
    console.log('[관악구 피바라기] 마운트: localStorage에서 로드', {
      playersCount: loadedPlayers.length,
      hasAssignment: !!loadedAssignment,
      assignmentCreatedAt: loadedAssignment?.createdAt,
      gamesCount: loadedBans.length,
    });
    setPlayersState(loadedPlayers);
    setAssignment(loadedAssignment);
    setSeriesBansState(loadedBans);
    setLinkedPairsState(getLinkedPairs());
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

  /** bump: 역할이 꽉 찼을 때, 해당 역할을 가진 다른 한 명의 역할을 ''로 바꿈. bannedRoles: 해당 참가자 포지션 금지 목록 */
  const handleSlotChange = useCallback(
    (
      index: number,
      name: string,
      mmr: number,
      rolePreference: RolePreference,
      bump?: { index: number; rolePreference: '' },
      bannedRoles?: Role[],
    ) => {
      const next = [...players];
      const pref: RolePreference | undefined = rolePreference || undefined;
      next[index] = {
        ...next[index],
        name,
        mmr,
        rolePreference: pref,
        ...(bannedRoles !== undefined && {
          bannedRoles: bannedRoles.length ? bannedRoles : undefined,
        }),
      };
      if (bump) {
        next[bump.index] = {
          ...next[bump.index],
          rolePreference: bump.rolePreference ?? undefined,
        };
      }
      persistPlayers(next);
      if (assignment) {
        const id = next[index].id;
        const patch: Partial<Player> = {
          name,
          mmr,
          rolePreference: pref,
          ...(bannedRoles !== undefined && {
            bannedRoles: bannedRoles?.length ? bannedRoles : undefined,
          }),
        };
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
              p.id === id
                ? { ...p, ...patch }
                : bumpId && p.id === bumpId
                  ? { ...p, ...bumpPatch }
                  : p,
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
    if (countValidMmr(players) !== 10) {
      console.log('[관악구 피바라기] 팀 나누기 중단: MMR 유효 10명 아님');
      return;
    }
    const filled = fillEmptyNames(players);
    persistPlayers(filled);
    const valid = filled.filter((p) => p.name.trim() !== '' && !Number.isNaN(p.mmr) && p.mmr >= 0);
    if (valid.length !== 10) {
      alert('팀 나누기 실패. 10명 모두 MMR을 입력했는지 확인하세요.');
      return;
    }
    try {
      const { teamA, teamB } = divideTeams(valid, linkedPairs);
      const next = createEmptyAssignment(teamA, teamB);
      console.log('[관악구 피바라기] 팀 나누기 결과 생성됨, createdAt:', next.createdAt);
      persistAssignment(next);
      setActiveTab('result');
      console.log('[관악구 피바라기] 팀 나누기 완료, 결과 탭으로 이동');
    } catch (e) {
      console.error('[관악구 피바라기] 팀 나누기 예외:', e);
      alert(e instanceof Error ? e.message : '팀 나누기 실패.');
    }
  }, [players, linkedPairs, persistPlayers, persistAssignment]);

  const handleAssignRoles = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 역할 랜덤 배정 / 역할만 다시 랜덤');
    if (!assignment || assignment.teamA.length !== 5 || assignment.teamB.length !== 5) return;
    // 참가자 명단의 최신 bannedRoles를 반영해 금지 포지션에 배정되지 않도록 함
    const latestById = new Map(playersRef.current.map((p) => [p.id, p]));
    const teamAWithBans = assignment.teamA.map((p) => ({
      ...p,
      ...latestById.get(p.id),
    }));
    const teamBWithBans = assignment.teamB.map((p) => ({
      ...p,
      ...latestById.get(p.id),
    }));
    const rolesA = assignRoles(teamAWithBans);
    const rolesB = assignRoles(teamBWithBans);
    const next: TeamAssignment = {
      teamA: teamAWithBans,
      teamB: teamBWithBans,
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
    setLastAssignment(next);
  }, [assignment]);

  /** 완전 초기화: localStorage 삭제, 참가자·밴 목록·배정 결과 제거, 참가자 탭으로 */
  const handleFullReset = useCallback(() => {
    if (!window.confirm('모든 참가자, 같은 팀 지정, 밴 목록, 팀 결과가 삭제됩니다. 정말 초기화할까요?')) return;
    console.log('[관악구 피바라기] 완전 초기화');
    clearAllStorage();
    const empty = getDefaultPlayers();
    setPlayersState(empty);
    setPlayers(empty);
    setAssignment(null);
    setSeriesBansState([]);
    setLinkedPairsState([]);
    setActiveTab('participants');
  }, []);

  /** 시리즈 밴 목록 변경 (로컬 저장) */
  const handleSeriesBansUpdate = useCallback((next: SeriesBans) => {
    setSeriesBansState(next);
    setSeriesBans(next);
  }, []);

  /** 참가자 명단(10명)을 랜덤 셔플해 1팀·2팀 재구성. 누를 때마다 다른 조합 */
  const handleRedivide = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 다시 나누기');
    const currentPlayers = playersRef.current;
    if (countValidMmr(currentPlayers) !== 10) return;
    const filled = fillEmptyNames(currentPlayers);
    persistPlayers(filled);
    const valid = filled.filter((p) => p.name.trim() !== '' && !Number.isNaN(p.mmr) && p.mmr >= 0);
    if (valid.length !== 10) return;
    try {
      const { teamA, teamB } = divideTeamsRandom(valid, linkedPairs);
      const next = createEmptyAssignment(teamA, teamB);
      console.log('[관악구 피바라기] 다시 나누기 결과 생성됨, createdAt:', next.createdAt);
      flushSync(() => setAssignment(next));
      setLastAssignment(next);
      console.log('[관악구 피바라기] 다시 나누기 완료 (랜덤 1팀·2팀)');
    } catch (e) {
      console.error('[관악구 피바라기] 다시 나누기 예외:', e);
      alert(e instanceof Error ? e.message : '다시 나누기 실패.');
    }
  }, [linkedPairs, persistPlayers]);

  if (!mounted) {
    return (
      <div className='relative z-10 flex min-h-screen items-center justify-center font-cinzel text-lol-gold'>
        로딩 중...
      </div>
    );
  }

  const valid = validPlayers(players);
  const validMmrCount = countValidMmr(players);
  const canDivide = validMmrCount === 10;
  const hasAssignment = assignment !== null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'participants', label: '참가자' },
    { id: 'result', label: '결과' },
    { id: 'bans', label: '밴 목록' },
  ];

  return (
    <main className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
      <div className='lol-panel w-full max-w-6xl'>
        <header className='lol-panel-header px-4 py-6 text-center sm:px-6 sm:py-8'>
          <h1 className='font-cinzel text-2xl font-bold uppercase tracking-[0.25em] text-lol-gold drop-shadow-sm sm:text-3xl'>
            LoL 5vs5 내전
          </h1>
          <div className='mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-lol-gold/60 to-transparent' />
          <p className='lol-desc mt-3 tracking-wide text-lol-muted'>
            관악구 피바라기 · MMR 밸런스 팀 분배 · 역할 랜덤 배정
          </p>
        </header>

        <div className='flex border-b border-lol-border bg-lol-bg-card/50' role='tablist'>
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
              className={`min-w-[5rem] flex-1 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-200 sm:py-4 sm:text-base ${
                activeTab === id
                  ? 'border-b-2 border-lol-gold bg-lol-card/70 text-lol-gold -mb-px shadow-[0_-2px_8px_rgba(0,0,0,0.2)]'
                  : 'text-lol-muted hover:bg-lol-card/30 hover:text-lol-gold-bright'
              }`}
            >
              {label}
              {id === 'participants' && (
                <span className='lol-desc ml-1.5 font-normal text-lol-muted'>
                  ({validMmrCount}/10)
                </span>
              )}
              {id === 'bans' && seriesBans.length > 0 && (
                <span className='lol-desc ml-1.5 font-normal text-lol-muted'>
                  ({seriesBans.length}경기)
                </span>
              )}
            </button>
          ))}
        </div>

        <div className='min-h-[320px] overflow-auto px-4 py-5 sm:px-6 sm:py-6'>
          {activeTab === 'participants' && (
            <div className='flex flex-col gap-5'>
              <ParticipantSlots slots={players} onChange={handleSlotChange} />
              <LinkedPairsEditor
                slots={players}
                linkedPairs={linkedPairs}
                onAdd={(id1, id2) => {
                  const next: LinkedPairs = [...linkedPairs, [id1, id2].sort() as [string, string]];
                  setLinkedPairsState(next);
                  setLinkedPairs(next);
                }}
                onRemove={(index) => {
                  const next = linkedPairs.filter((_, i) => i !== index);
                  setLinkedPairsState(next);
                  setLinkedPairs(next);
                }}
              />
              {validMmrCount > 0 && validMmrCount < 10 && (
                <p className='lol-desc rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-amber-300/95'>
                  팀 나누기를 하려면 10명 모두 MMR을 입력하세요. 이름이 비어 있으면 롤 챔피언 이름으로 자동 채워집니다.
                </p>
              )}
              <div className='flex flex-wrap justify-center gap-4 pt-2'>
                <button
                  type='button'
                  onClick={() => {
                    console.log('[관악구 피바라기] 버튼 클릭: 팀 나누기 (참가자 탭)');
                    handleDivideTeams();
                  }}
                  disabled={!canDivide}
                  className='lol-btn-primary min-w-[160px] rounded-lg py-3.5 shadow-md'
                >
                  팀 나누기
                </button>
                <button
                  type='button'
                  onClick={handleFullReset}
                  className='lol-btn-secondary min-w-[130px] rounded-lg py-3'
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
                  <div className='lol-divider my-2' />
                  <div className='flex flex-wrap justify-center gap-3'>
                    <button
                      type='button'
                      title='참가자 명단(10명)을 랜덤으로 다시 섞어 1팀·2팀으로 나눕니다'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 다시 나누기');
                        handleRedivide();
                      }}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
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
                      className='lol-btn-primary min-w-[140px] rounded-lg py-2.5 shadow-md'
                    >
                      역할 랜덤 배정
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 참가자 수정');
                        setActiveTab('participants');
                      }}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
                    >
                      참가자 수정
                    </button>
                    <button
                      type='button'
                      onClick={handleFullReset}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
                      title='참가자·팀 결과 전부 삭제 후 처음부터'
                    >
                      완전 초기화
                    </button>
                  </div>
                </>
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-lol-border bg-lol-bg-card/50 py-12 text-center'>
                  <p className='mb-5 text-lol-muted'>아직 팀이 나뉘지 않았습니다.</p>
                  <button
                    type='button'
                    onClick={() => {
                      console.log('[관악구 피바라기] 버튼 클릭: 참가자 탭에서 팀 나누기');
                      setActiveTab('participants');
                    }}
                    className='lol-btn-primary min-w-[200px] rounded-lg py-3.5 shadow-md'
                  >
                    참가자 탭에서 팀 나누기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bans' && (
            <div className='flex flex-col gap-4'>
              <SeriesBanList games={seriesBans} onUpdate={handleSeriesBansUpdate} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
