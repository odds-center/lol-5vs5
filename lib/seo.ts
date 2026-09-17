import type { Locale } from '@/lib/i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lol-5vs5.vercel.app';
export const SITE_NAME = 'LoL 5vs5 내전';
export const SITE_NAME_EN = 'LoL 5v5 In-house Team Maker';
export const AUTHOR = '관악구 피바라기';

/** 검색 결과 제목: 핵심 검색어(롤 내전 팀짜기)를 앞에 둔다 */
export const SITE_TITLE = '롤 내전 팀짜기 - MMR 밸런스 팀 나누기 · 라인 랜덤 배정 | LoL 5vs5 내전';

/** 검색 결과 설명 (한국어 단일 언어, 약 150자) */
export const SITE_DESCRIPTION =
  '롤 내전 팀짜기 무료 사이트. 10명의 닉네임과 MMR만 입력하면 5대5 밸런스 팀을 자동으로 나누고 탑·정글·미드·원딜·서폿 라인을 배정합니다. 듀오 같은 팀 지정, 피어리스 내전용 시리즈 밴 목록까지 로그인 없이 바로 사용하세요.';

export const KEYWORDS = [
  '롤 내전 팀짜기',
  '롤 내전 팀 나누기',
  '롤 팀짜기',
  '롤 팀짜기 사이트',
  '롤 내전 사이트',
  '롤 내전 도우미',
  '내전 팀짜기',
  '내전 밸런스 팀짜기',
  '롤 밸런스 팀 나누기',
  '롤 5대5 내전',
  '롤 사용자 설정 게임 팀 나누기',
  '롤 라인 랜덤',
  '롤 포지션 랜덤',
  '롤 내전 듀오 같은 팀',
  '롤 MMR 팀 분배',
  '랜덤 팀 나누기',
  '피어리스 밴 목록',
  '롤 피어리스 내전',
  '리그 오브 레전드 내전',
  'LoL in-house team maker',
  'LoL team balancer',
  'League of Legends custom game team generator',
  'LoL random role',
];

export const FEATURE_LIST = [
  'MMR 합이 비슷한 5대5 밸런스 팀 자동 나누기',
  '선호 라인·금지 라인을 반영한 탑/정글/미드/원딜/서폿 라인 배정',
  '듀오처럼 반드시 같은 팀이어야 하는 참가자 묶기 (같은 팀 지정)',
  '다전제·피어리스 내전용 경기별 블루/레드 5밴 시리즈 밴 목록',
  '한국어/영어 지원, 로그인 없이 브라우저에 자동 저장',
];

export interface GuideContent {
  heading: string;
  intro: string;
  stepsTitle: string;
  steps: string[];
  featuresTitle: string;
  features: { title: string; body: string }[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
}

/** 페이지 하단 사용 가이드 + FAQ. FAQ는 JSON-LD(FAQPage)에도 그대로 사용한다 */
export const GUIDE: Record<Locale, GuideContent> = {
  ko: {
    heading: '롤 내전 팀짜기, 1분이면 끝',
    intro:
      '친구·클랜·디스코드 서버에서 리그 오브 레전드 5대5 내전(사용자 설정 게임)을 할 때, 실력 차이 없이 공정하게 팀을 나누고 라인까지 정해 주는 무료 내전 도우미입니다. 회원가입 없이 바로 쓸 수 있고 입력한 내용은 내 브라우저에만 저장됩니다.',
    stepsTitle: '사용 방법',
    steps: [
      '참가자 탭에 10명의 닉네임과 MMR을 입력합니다. 정확한 MMR을 모르면 티어나 실력을 숫자로 바꿔 넣으면 되고, 숫자가 클수록 잘하는 사람으로 계산됩니다.',
      '원하는 라인(역할군)과 절대 가기 싫은 금지 라인을 고릅니다. 같은 라인은 최대 2명까지 선호할 수 있습니다.',
      '듀오처럼 꼭 같은 팀이어야 하는 사람은 ‘같은 팀 지정’에서 두 명씩 묶습니다.',
      '‘팀 나누기’를 누르면 MMR 합이 비슷한 블루팀·레드팀이 만들어지고 탑·정글·미드·원딜·서폿 라인이 배정됩니다. 결과가 마음에 들지 않으면 ‘다시 나누기’나 ‘역할 랜덤 배정’으로 다시 굴려 보세요.',
    ],
    featuresTitle: '주요 기능',
    features: [
      {
        title: 'MMR 밸런스 팀 나누기',
        body: '10명을 MMR 순으로 정렬해 두 팀에 번갈아 배치하므로 양 팀 MMR 합계와 평균이 비슷해집니다. 결과 화면에서 팀별 MMR 합계·평균을 바로 비교할 수 있습니다.',
      },
      {
        title: '라인(포지션) 랜덤 배정',
        body: '선호 라인은 최대한 반영하고 금지 라인은 피해서 배정합니다. ‘역할 랜덤 배정’을 누르면 팀은 그대로 두고 라인만 새로 섞습니다.',
      },
      {
        title: '같은 팀 지정 (듀오 묶기)',
        body: '묶은 참가자는 팀 나누기와 다시 나누기 모두에서 항상 같은 팀에 들어갑니다. 1-2, 2-3처럼 여러 쌍을 이으면 3명 이상도 한 팀으로 묶입니다.',
      },
      {
        title: '시리즈 밴 목록 (피어리스 내전)',
        body: '다전제 내전에서 경기마다 블루팀·레드팀 밴 5개씩을 기록합니다. 챔피언을 한글/영문으로 검색하고 라인별로 걸러 볼 수 있으며, 한 경기 안에서는 같은 챔피언을 중복으로 밴할 수 없습니다.',
      },
    ],
    faqTitle: '자주 묻는 질문',
    faq: [
      {
        question: '롤 내전 팀은 어떤 기준으로 나누나요?',
        answer:
          '참가자 10명의 MMR을 높은 순으로 정렬한 뒤 두 팀에 번갈아 배치해 양 팀 MMR 합이 비슷하도록 나눕니다. 같은 팀으로 지정한 묶음이 있으면 묶음 단위로 MMR 합이 더 낮은 팀에 배치합니다.',
      },
      {
        question: '정확한 MMR을 모르면 어떻게 입력하나요?',
        answer:
          '티어나 평소 실력을 숫자로 바꿔 입력하면 됩니다. 숫자가 클수록 잘하는 사람으로 계산되므로 참가자끼리 같은 기준만 지키면 됩니다. 닉네임을 비워 두면 롤 챔피언 이름으로 자동으로 채워집니다.',
      },
      {
        question: '듀오를 같은 팀에 넣을 수 있나요?',
        answer:
          '네. ‘같은 팀 지정’에서 두 참가자를 선택해 추가하면 팀 나누기와 다시 나누기 모두에서 항상 같은 팀에 배치됩니다. 여러 쌍을 추가하면 3명 이상도 한 팀으로 묶을 수 있습니다.',
      },
      {
        question: '라인(포지션)도 자동으로 정해 주나요?',
        answer:
          '네. 참가자별 선호 라인과 금지 라인을 반영해 탑·정글·미드·원딜·서폿을 팀마다 한 명씩 배정합니다. 결과 화면의 ‘역할 랜덤 배정’을 누르면 금지 라인은 피하면서 라인을 무작위로 다시 정합니다.',
      },
      {
        question: '피어리스 내전 밴 기록도 할 수 있나요?',
        answer:
          '‘밴 목록’ 탭에서 경기를 추가하고 블루팀·레드팀 밴을 5개씩 기록할 수 있습니다. 경기별 기록이 누적되므로 다전제나 피어리스 방식 내전에서 이전 경기 밴을 한눈에 확인할 수 있습니다.',
      },
      {
        question: '회원가입이나 설치가 필요한가요?',
        answer:
          '아니요. 로그인이나 설치 없이 무료로 사용할 수 있고, 입력한 참가자·팀 결과·밴 목록은 서버로 전송되지 않고 사용자의 브라우저에만 저장됩니다.',
      },
    ],
  },
  en: {
    heading: 'Split a LoL in-house in one minute',
    intro:
      'A free team maker for League of Legends 5v5 in-house (custom) games with friends, clans or Discord servers. It splits players into fair teams and assigns lanes. No sign-up needed, and everything you enter stays in your browser.',
    stepsTitle: 'How to use',
    steps: [
      'Enter 10 nicknames and MMRs on the Participants tab. If you do not know the exact MMR, convert rank or skill to a number; a higher number means a stronger player.',
      'Pick a preferred role and any roles the player refuses to play. Up to 2 players can prefer the same role.',
      'Link players who must stay together, such as a duo, under “Same Team”.',
      'Press “Divide Teams” to get Blue and Red teams with similar MMR totals and assigned roles. Not happy with it? Use “Redivide” or “Random Roles” to roll again.',
    ],
    featuresTitle: 'Features',
    features: [
      {
        title: 'MMR-balanced teams',
        body: 'Players are sorted by MMR and placed on alternating teams, so both teams end up with similar MMR totals and averages, shown on the result screen.',
      },
      {
        title: 'Random role assignment',
        body: 'Preferred roles are respected where possible and banned roles are avoided. “Random Roles” reshuffles roles while keeping the teams.',
      },
      {
        title: 'Same team (duo lock)',
        body: 'Linked players always land on the same team for both Divide and Redivide. Chain pairs like 1-2 and 2-3 to lock three or more players together.',
      },
      {
        title: 'Series ban list (fearless in-house)',
        body: 'Record 5 blue and 5 red bans for every game of a series. Search champions in Korean or English, filter by role, and duplicate bans within a game are blocked.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        question: 'How are the teams balanced?',
        answer:
          'The 10 players are sorted by MMR from highest to lowest and placed on alternating teams so the MMR totals are close. Linked groups are placed as a unit on the team with the lower MMR total.',
      },
      {
        question: 'What if I do not know the exact MMR?',
        answer:
          'Convert rank or skill into a number using the same scale for everyone; higher means stronger. Empty nicknames are filled with LoL champion names automatically.',
      },
      {
        question: 'Can I keep a duo on the same team?',
        answer:
          'Yes. Add the two players under “Same Team” and they will always be placed together for both Divide and Redivide.',
      },
      {
        question: 'Does it assign lanes too?',
        answer:
          'Yes. Top, jungle, mid, ADC and support are assigned per team using each player’s preferred and banned roles. “Random Roles” rerolls lanes while avoiding banned roles.',
      },
      {
        question: 'Do I need an account?',
        answer:
          'No. It is free with no login or install, and your data is stored only in your browser.',
      },
    ],
  },
};
