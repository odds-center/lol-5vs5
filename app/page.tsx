'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import type { FearlessMode, LinkedPairs, Player, SeriesDraft, TeamAssignment } from '@/types';
import {
  getPlayers,
  setPlayers,
  getLastAssignment,
  setLastAssignment,
  getDefaultPlayers,
  clearAllStorage,
  getSeriesDraft,
  setSeriesDraft,
  getFearlessMode,
  setFearlessMode,
  getLinkedPairs,
  setLinkedPairs,
} from '@/lib/storage';
import { divideTeams, divideTeamsRandom } from '@/lib/teamAlgorithm';
import { assignRoles, assignRolesWithPreferences } from '@/lib/roleAssignment';
import { fillEmptyNames } from '@/lib/randomNames';
import LanguageSelector from '@/components/LanguageSelector';
import LinkedPairsEditor from '@/components/LinkedPairsEditor';
import ParticipantSlots, {
  type SlotChangeBump,
  type SlotPatch,
} from '@/components/ParticipantSlots';
import SeriesDraftBoard from '@/components/SeriesDraftBoard';
import TeamDivisionResult from '@/components/TeamDivisionResult';
import { useTranslation } from '@/components/LanguageProvider';
import { useDialog } from '@/components/DialogProvider';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation();
  const dialog = useDialog();
  const [players, setPlayersState] = useState<Player[]>([]);
  const [assignment, setAssignment] = useState<TeamAssignment | null>(null);
  const [seriesDraft, setSeriesDraftState] = useState<SeriesDraft>([]);
  const [fearlessMode, setFearlessModeState] = useState<FearlessMode>('off');
  const [linkedPairs, setLinkedPairsState] = useState<LinkedPairs>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('participants');

  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    const loadedPlayers = getPlayers();
    const loadedAssignment = getLastAssignment();
    const loadedDraft = getSeriesDraft();
    console.log('[관악구 피바라기] 마운트: localStorage에서 로드', {
      playersCount: loadedPlayers.length,
      hasAssignment: !!loadedAssignment,
      assignmentCreatedAt: loadedAssignment?.createdAt,
      gamesCount: loadedDraft.length,
    });
    setPlayersState(loadedPlayers);
    setAssignment(loadedAssignment);
    setSeriesDraftState(loadedDraft);
    setFearlessModeState(getFearlessMode());
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

  /** 빈 문자열/빈 배열은 저장하지 않도록 undefined로 정규화 */
  const normalizePatch = (patch: SlotPatch): Partial<Player> => {
    const next: Partial<Player> = { ...patch };
    if ('rolePreference' in patch) next.rolePreference = patch.rolePreference || undefined;
    if ('bannedRoles' in patch) next.bannedRoles = patch.bannedRoles?.length ? patch.bannedRoles : undefined;
    if ('fixedTeam' in patch) next.fixedTeam = patch.fixedTeam || undefined;
    return next;
  };

  /** bump: 역할이 꽉 찼을 때, 해당 역할을 가진 다른 한 명의 역할을 ''로 바꿈 */
  const handleSlotChange = useCallback(
    (index: number, patch: SlotPatch, bump?: SlotChangeBump) => {
      const normalized = normalizePatch(patch);
      const next = [...players];
      next[index] = { ...next[index], ...normalized };
      const bumpPatch: Partial<Player> | null = bump ? { rolePreference: undefined } : null;
      if (bump && bumpPatch) {
        next[bump.index] = { ...next[bump.index], ...bumpPatch };
      }
      persistPlayers(next);
      if (assignment) {
        const id = next[index].id;
        const bumpId = bump ? next[bump.index].id : null;
        const updateInTeam = (team: Player[], pid: string, p: Partial<Player>) =>
          team.map((pl) => (pl.id === pid ? { ...pl, ...p } : pl));
        let teamA = updateInTeam(assignment.teamA, id, normalized);
        let teamB = updateInTeam(assignment.teamB, id, normalized);
        if (bumpId && bumpPatch) {
          teamA = updateInTeam(teamA, bumpId, bumpPatch);
          teamB = updateInTeam(teamB, bumpId, bumpPatch);
        }
        const patchRoleEntry = (roles: TeamAssignment['rolesA']) =>
          Object.fromEntries(
            Object.entries(roles).map(([r, p]) => [
              r,
              p.id === id
                ? { ...p, ...normalized }
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

  /** 모든 참가자의 1팀·2팀 고정을 해제 */
  const handleClearFixedTeams = useCallback(() => {
    console.log('[관악구 피바라기] 버튼 클릭: 팀 고정 해제');
    persistPlayers(players.map((p) => ({ ...p, fixedTeam: undefined })));
  }, [players, persistPlayers]);

  const handleDivideTeams = useCallback(async () => {
    console.log('[관악구 피바라기] 버튼 클릭: 팀 나누기');
    if (countValidMmr(players) !== 10) {
      console.log('[관악구 피바라기] 팀 나누기 중단: MMR 유효 10명 아님');
      return;
    }
    const filled = fillEmptyNames(players);
    persistPlayers(filled);
    const valid = filled.filter((p) => p.name.trim() !== '' && !Number.isNaN(p.mmr) && p.mmr >= 0);
    if (valid.length !== 10) {
      await dialog.alert({ message: t('divideFailMmr') });
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
      await dialog.alert({ message: e instanceof Error ? e.message : t('divideFail') });
    }
  }, [players, linkedPairs, persistPlayers, persistAssignment, dialog, t]);

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
  const handleFullReset = useCallback(async () => {
    const ok = await dialog.confirm({
      title: t('fullReset'),
      message: t('fullResetConfirm'),
      confirmLabel: t('fullReset'),
      danger: true,
    });
    if (!ok) return;
    console.log('[관악구 피바라기] 완전 초기화');
    clearAllStorage();
    const empty = getDefaultPlayers();
    setPlayersState(empty);
    setPlayers(empty);
    setAssignment(null);
    setSeriesDraftState([]);
    setFearlessModeState('off');
    setLinkedPairsState([]);
    setActiveTab('participants');
  }, [dialog, t]);

  /** 시리즈 밴픽 변경 (로컬 저장) */
  const handleSeriesDraftUpdate = useCallback((next: SeriesDraft) => {
    setSeriesDraftState(next);
    setSeriesDraft(next);
  }, []);

  const handleFearlessModeChange = useCallback((mode: FearlessMode) => {
    console.log('[관악구 피바라기] 피어리스 모드 변경:', mode);
    setFearlessModeState(mode);
    setFearlessMode(mode);
  }, []);

  /** 참가자 명단(10명)을 랜덤 셔플해 1팀·2팀 재구성. 누를 때마다 다른 조합 */
  const handleRedivide = useCallback(async () => {
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
      await dialog.alert({ message: e instanceof Error ? e.message : t('redivideFail') });
    }
  }, [linkedPairs, persistPlayers, dialog, t]);

  if (!mounted) {
    return (
      <div className='relative z-10 flex min-h-screen items-center justify-center font-cinzel text-lol-gold'>
        {t('loading')}
      </div>
    );
  }

  const valid = validPlayers(players);
  const validMmrCount = countValidMmr(players);
  const fixedTeamCount = players.filter((p) => (p.fixedTeam ?? '') !== '').length;
  const canDivide = validMmrCount === 10;
  const hasAssignment = assignment !== null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'participants', label: t('tabParticipants') },
    { id: 'result', label: t('tabResult') },
    { id: 'bans', label: t('tabBans') },
  ];

  return (
    <main className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
      <div className='lol-panel w-full max-w-6xl'>
        <header className='lol-panel-header relative px-4 py-6 text-center sm:px-6 sm:py-8'>
          <LanguageSelector />
          <h1 className='lol-title-gold font-cinzel text-2xl font-bold uppercase tracking-[0.28em] sm:text-4xl'>
            {t('appTitle')}
          </h1>
          <div className='lol-ornament mx-auto mt-4 w-40' />
          <p className='lol-desc mt-3 tracking-wide text-lol-muted'>
            {t('appSubtitle')}
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
              className={cn(
                'lol-tab min-w-[5rem] flex-1 py-3.5 font-cinzel text-sm font-bold uppercase tracking-[0.18em] sm:py-4 sm:text-base',
                activeTab === id
                  ? 'text-lol-gold-bright'
                  : 'text-lol-muted hover:bg-lol-card/30 hover:text-lol-gold-bright',
              )}
            >
              {label}
              {id === 'participants' && (
                <span className='lol-desc ml-1.5 font-normal text-lol-muted'>
                  ({validMmrCount}/10)
                </span>
              )}
              {id === 'bans' && seriesDraft.length > 0 && (
                <span className='lol-desc ml-1.5 font-normal text-lol-muted'>
                  ({seriesDraft.length} {t('gamesCount')})
                </span>
              )}
            </button>
          ))}
        </div>

        <div key={activeTab} className='lol-animate-in min-h-[320px] overflow-auto px-4 py-3 sm:px-6 sm:py-4'>
          {activeTab === 'participants' && (
            <div className='flex flex-col gap-3'>
              <ParticipantSlots slots={players} onChange={handleSlotChange} />
              <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lol-border/70 bg-lol-bg-card/60 px-4 py-3'>
                <p className='lol-desc max-w-3xl text-lol-muted'>{t('fixedTeamHint')}</p>
                <button
                  type='button'
                  onClick={handleClearFixedTeams}
                  disabled={fixedTeamCount === 0}
                  className='lol-btn-secondary shrink-0 rounded-lg px-4 py-2'
                  title={t('clearFixedTeamsTitle')}
                >
                  {t('clearFixedTeams')}
                </button>
              </div>
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
                  {t('needMmrAll')}
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
                  {t('divideTeams')}
                </button>
                <button
                  type='button'
                  onClick={handleFullReset}
                  className='lol-btn-secondary min-w-[130px] rounded-lg py-3'
                  title={t('fullResetTitle')}
                >
                  {t('fullReset')}
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
                  <div className='lol-ornament my-3' />
                  <div className='flex flex-wrap justify-center gap-3'>
                    <button
                      type='button'
                      title={t('redivideTitle')}
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 다시 나누기');
                        handleRedivide();
                      }}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
                    >
                      {t('redivide')}
                    </button>
                    <button
                      type='button'
                      title={t('assignRolesTitle')}
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 역할 랜덤 배정');
                        handleAssignRoles();
                      }}
                      className='lol-btn-primary min-w-[140px] rounded-lg py-2.5 shadow-md'
                    >
                      {t('assignRoles')}
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        console.log('[관악구 피바라기] 버튼 클릭: 참가자 수정');
                        setActiveTab('participants');
                      }}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
                    >
                      {t('editParticipants')}
                    </button>
                    <button
                      type='button'
                      onClick={handleFullReset}
                      className='lol-btn-secondary min-w-[120px] rounded-lg py-2.5'
                      title={t('fullResetTitle')}
                    >
                      {t('fullReset')}
                    </button>
                  </div>
                </>
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-lol-border bg-lol-bg-card/50 py-12 text-center'>
                  <p className='mb-5 text-lol-muted'>{t('noTeamYet')}</p>
                  <button
                    type='button'
                    onClick={() => {
                      console.log('[관악구 피바라기] 버튼 클릭: 참가자 탭에서 팀 나누기');
                      setActiveTab('participants');
                    }}
                    className='lol-btn-primary min-w-[200px] rounded-lg py-3.5 shadow-md'
                  >
                    {t('goToParticipantsTab')}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bans' && (
            <div className='flex flex-col gap-4'>
              <SeriesDraftBoard
                games={seriesDraft}
                fearlessMode={fearlessMode}
                onUpdate={handleSeriesDraftUpdate}
                onFearlessModeChange={handleFearlessModeChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
