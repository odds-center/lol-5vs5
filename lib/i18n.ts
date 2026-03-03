import type { Role } from '@/types';

export type Locale = 'ko' | 'en';

const LOCALE_STORAGE_KEY = 'lol-5vs5-locale';

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ko';
  const v = localStorage.getItem(LOCALE_STORAGE_KEY);
  return v === 'en' ? 'en' : 'ko';
}

export function setStoredLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

const translations = {
  ko: {
    loading: '로딩 중...',
    appTitle: 'LoL 5vs5 내전',
    appSubtitle: '관악구 피바라기 · MMR 밸런스 팀 분배 · 역할 랜덤 배정',
    tabParticipants: '참가자',
    tabResult: '결과',
    tabBans: '밴 목록',
    gamesCount: '경기',
    divideTeams: '팀 나누기',
    fullReset: '완전 초기화',
    fullResetTitle: '참가자·팀 결과 전부 삭제 후 처음부터',
    redivide: '다시 나누기',
    redivideTitle: '참가자 명단(10명)을 랜덤으로 다시 섞어 1팀·2팀으로 나눕니다',
    assignRoles: '역할 랜덤 배정',
    assignRolesTitle: '팀 내에서 역할을 랜덤 배정합니다',
    editParticipants: '참가자 수정',
    goToParticipantsTab: '참가자 탭에서 팀 나누기',
    noTeamYet: '아직 팀이 나뉘지 않았습니다.',
    needMmrAll:
      '팀 나누기를 하려면 10명 모두 MMR을 입력하세요. 이름이 비어 있으면 롤 챔피언 이름으로 자동 채워집니다.',
    colNumber: '#',
    nickname: '닉네임',
    role: '역할군',
    positionBan: '포지션 금지',
    placeholderNickname: '닉네임',
    placeholderMmr: 'MMR',
    roleUnset: '미정',
    roleTop: '탑',
    roleJungle: '정글',
    roleMid: '미드',
    roleAdc: '원딜',
    roleSupport: '서폿',
    roleBan: '금지',
    sameTeamTitle: '같은 팀 지정',
    sameTeamSub: '(떨어지면 안 되는 조합)',
    sameTeamDesc: '지정한 두 명은 항상 같은 팀에 배치됩니다. 여러 쌍을 넣으면 묶임이 이어질 수 있습니다.',
    participant: '참가자',
    select: '선택',
    add: '추가',
    remove: '제거',
    seriesBan: 'Series Ban',
    noBansYet: '아직 밴 목록이 없습니다.',
    addGameBans: '1경기 밴 추가',
    game: '경기',
    resetGameBans: '이 경기 밴 초기화',
    resetGameBansTitle: '이 경기의 블루/레드 밴 목록만 비웁니다',
    blueTeamBan: '블루 팀 밴',
    redTeamBan: '레드 팀 밴',
    selected: '(선택됨)',
    selectChampion: '챔피언 선택',
    cancelSelect: '선택 취소',
    slotLabel: '슬롯',
    alreadyBannedInGame: '이미 이 경기에서 밴됨',
    emptySlot: '빈 슬롯',
    unban: '밴 해제',
    addNextGameBans: '다음 경기 밴 추가',
    teamBlue: '블루팀',
    teamRed: '레드팀',
    sum: '합계',
    avg: '평균',
    championSelect: '챔피언 선택',
    searchChampion: '챔피언 검색 (한/영)',
    searchNoResults: '검색 결과 없음',
    filterByRole: '역할군 필터',
  },
  en: {
    loading: 'Loading...',
    appTitle: 'LoL 5v5 In-house',
    appSubtitle: 'MMR-balanced team split · Random role assignment',
    tabParticipants: 'Participants',
    tabResult: 'Result',
    tabBans: 'Bans',
    gamesCount: 'game(s)',
    divideTeams: 'Divide Teams',
    fullReset: 'Full Reset',
    fullResetTitle: 'Delete all participants and team results',
    redivide: 'Redivide',
    redivideTitle: 'Shuffle 10 participants and split into two teams',
    assignRoles: 'Random Roles',
    assignRolesTitle: 'Randomly assign roles within each team',
    editParticipants: 'Edit Participants',
    goToParticipantsTab: 'Go to Participants to divide',
    noTeamYet: 'No teams divided yet.',
    needMmrAll:
      'Enter MMR for all 10 to divide teams. Empty names will be filled with LoL champion names.',
    colNumber: '#',
    nickname: 'Nickname',
    role: 'Role',
    positionBan: 'Position Ban',
    placeholderNickname: 'Nickname',
    placeholderMmr: 'MMR',
    roleUnset: 'Unset',
    roleTop: 'Top',
    roleJungle: 'Jungle',
    roleMid: 'Mid',
    roleAdc: 'ADC',
    roleSupport: 'Support',
    roleBan: 'Ban',
    sameTeamTitle: 'Same Team',
    sameTeamSub: '(must stay together)',
    sameTeamDesc: 'Selected two players will always be on the same team. Multiple pairs can be linked.',
    participant: 'Participant',
    select: 'Select',
    add: 'Add',
    remove: 'Remove',
    seriesBan: 'Series Ban',
    noBansYet: 'No bans yet.',
    addGameBans: 'Add Game 1 Bans',
    game: 'Game',
    resetGameBans: 'Reset This Game',
    resetGameBansTitle: 'Clear blue/red bans for this game only',
    blueTeamBan: 'Blue Bans',
    redTeamBan: 'Red Bans',
    selected: '(selected)',
    selectChampion: 'Select Champion',
    cancelSelect: 'Cancel',
    slotLabel: 'Slot',
    alreadyBannedInGame: 'Already banned this game',
    emptySlot: 'Empty slot',
    unban: 'Unban',
    addNextGameBans: 'Add Next Game',
    teamBlue: 'Blue',
    teamRed: 'Red',
    sum: 'Sum',
    avg: 'Avg',
    championSelect: 'Champion Select',
    searchChampion: 'Search champion (KO/EN)',
    searchNoResults: 'No results',
    filterByRole: 'Filter by role',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['ko'];

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.ko[key] ?? String(key);
}

const roleKeys: Record<Role, TranslationKey> = {
  top: 'roleTop',
  jungle: 'roleJungle',
  mid: 'roleMid',
  adc: 'roleAdc',
  support: 'roleSupport',
};

export function getRoleLabels(locale: Locale): Record<Role, string> {
  return {
    top: getTranslation(locale, 'roleTop'),
    jungle: getTranslation(locale, 'roleJungle'),
    mid: getTranslation(locale, 'roleMid'),
    adc: getTranslation(locale, 'roleAdc'),
    support: getTranslation(locale, 'roleSupport'),
  };
}

export { translations };
