import type { Metadata } from 'next';
import { Cinzel, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-spiegel',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lol-5vs5.vercel.app';
const SITE_NAME_KO = 'LoL 5vs5 내전 | 관악구 피바라기';
const SITE_NAME_EN = 'LoL 5v5 In-house | Team Split & Random Roles';
const SITE_DESC_KO =
  '롤 내전 팀 나누기, MMR 밸런스 팀 분배, 역할 랜덤 배정, 같은 팀 지정, 시리즈 밴 목록까지 한 페이지에서. 롤 팀 정하기·랜덤 팀 나누기 무료 도구.';
const SITE_DESC_EN =
  'LoL in-house team split by MMR, random role assignment, same-team pinning, series ban list. Free 5v5 custom game tool.';
const KEYWORDS_KO = [
  '랜덤 팀 나누기',
  '롤 내전 팀 나누기',
  '롤 내전 사이트',
  '롤 팀 내전',
  '롤 팀 나누기',
  '롤 팀 정하기',
  '롤 5대5 내전',
  '리그 오브 레전드 팀 나누기',
  '롤 MMR 팀 분배',
  '롤 역할 랜덤',
  '롤 같은 팀 지정',
  '롤 밴 목록',
  '롤 내전 도구',
];
const KEYWORDS_EN = [
  'LoL team split',
  'LoL in-house',
  'random team generator',
  'LoL 5v5',
  'MMR balance',
  'random roles LoL',
  'League of Legends team split',
  'custom game team maker',
  'LoL same team pin',
  'LoL ban list',
];
const KEYWORDS = [...KEYWORDS_KO, ...KEYWORDS_EN];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME_KO} | ${SITE_NAME_EN}`,
    template: `%s | LoL 5vs5`,
  },
  description: `${SITE_DESC_KO} ${SITE_DESC_EN}`,
  keywords: KEYWORDS,
  authors: [{ name: '관악구 피바라기', url: SITE_URL }],
  creator: '관악구 피바라기',
  publisher: '관악구 피바라기',
  applicationName: SITE_NAME_KO,
  category: 'games',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  alternates: {
    canonical: '/',
    languages: {
      ko: `${SITE_URL}/`,
      en: `${SITE_URL}/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    title: `${SITE_NAME_KO} | ${SITE_NAME_EN}`,
    description: `${SITE_DESC_KO} ${SITE_DESC_EN}`,
    siteName: SITE_NAME_KO,
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: SITE_NAME_KO,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME_KO} | ${SITE_NAME_EN}`,
    description: `${SITE_DESC_KO} ${SITE_DESC_EN}`,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME_KO,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    description: SITE_DESC_KO,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any (Web)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: ['ko', 'en'],
    keywords: KEYWORDS.join(', '),
    image: `${SITE_URL}/logo.png`,
    screenshot: `${SITE_URL}/logo.png`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    author: { '@type': 'Person', name: '관악구 피바라기' },
    publisher: { '@type': 'Person', name: '관악구 피바라기' },
    featureList: [
      'MMR 기반 5대5 자동 팀 분배',
      '역할(탑/정글/미드/원딜/서포터) 랜덤 배정 및 선호/금지 반영',
      '같은 팀에 반드시 들어가야 하는 참가자 묶음 지정',
      '시리즈 밴 목록 (블루/레드 5밴) 누적 관리',
      '한국어/영어 다국어 지원',
      '브라우저 로컬 저장 (서버 가입 없이 사용)',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME_KO,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    inLanguage: ['ko', 'en'],
    publisher: { '@type': 'Person', name: '관악구 피바라기' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '롤 내전 팀을 어떻게 나눠주나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '참가자 10명의 닉네임과 MMR을 입력하면 MMR 합이 비슷하도록 5대5로 자동 분배합니다. 같은 팀 지정한 묶음은 항상 같은 팀에 함께 배치됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '같은 팀 지정은 어떻게 동작하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '“같은 팀 지정” 영역에서 두 참가자를 선택해 묶으면, 팀 나누기 및 다시 나누기 시 두 사람이 같은 팀으로 배치됩니다. 여러 쌍을 추가해 3명 이상도 한 팀으로 묶을 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '역할(포지션) 배정도 자동인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '각 참가자의 선호 포지션과 금지 포지션을 반영해 탑/정글/미드/원딜/서포터를 자동 배정합니다. “역할 랜덤 배정” 버튼으로 다시 굴릴 수도 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '계정 가입이 필요한가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. 로그인 없이 무료로 사용할 수 있고, 입력한 참가자·밴 목록은 사용자의 브라우저에만 저장됩니다.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className={cn(cinzel.variable, notoSansKr.variable)}>
      <body className='min-h-screen antialiased font-spiegel'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
