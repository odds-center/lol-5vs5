import type { Metadata } from 'next';
import { Cinzel, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import DoorIntro from '@/components/DoorIntro';
import { LanguageProvider } from '@/components/LanguageProvider';
import { INTRO_SCRIPT } from '@/lib/intro';
import {
  AUTHOR,
  FEATURE_LIST,
  GUIDE,
  KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/seo';
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

/** 전역 스크롤바 숨김 (html 자신 + 모든 하위 요소) */
const HIDE_SCROLLBARS =
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden';

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  applicationName: SITE_NAME,
  category: 'games',
  icons: {
    icon: '/logo-512.png',
    apple: '/logo-512.png',
    shortcut: '/logo-512.png',
  },
  // 언어별 URL이 따로 없으므로 hreflang 없이 canonical만 둔다
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'ko_KR',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-512.png',
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  // 로고가 정사각형이라 큰 이미지 카드 대신 summary 카드 사용
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo-512.png'],
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
  // 구글 서치 콘솔 / 네이버 서치어드바이저 소유 확인 (Vercel 환경 변수로 설정)
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(naverVerification ? { other: { 'naver-site-verification': naverVerification } } : {}),
  },
  formatDetection: { telephone: false, email: false, address: false },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    alternateName: [SITE_TITLE, SITE_NAME_EN, '롤 내전 팀짜기'],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any (Web)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: ['ko', 'en'],
    keywords: KEYWORDS.join(', '),
    image: `${SITE_URL}/logo-512.png`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    author: { '@type': 'Organization', name: AUTHOR },
    publisher: { '@type': 'Organization', name: AUTHOR },
    featureList: FEATURE_LIST,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: [SITE_NAME_EN, '롤 내전 팀짜기'],
    url: SITE_URL,
    inLanguage: 'ko',
    publisher: { '@type': 'Organization', name: AUTHOR },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    // 페이지 하단 GuideSection에 보이는 FAQ와 동일한 데이터
    mainEntity: GUIDE.ko.faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ko'
      className={cn(cinzel.variable, notoSansKr.variable, 'text-[16px]', HIDE_SCROLLBARS)}
      // INTRO_SCRIPT가 hydration 전에 data-intro 속성을 붙인다
      suppressHydrationWarning
    >
      <body className='min-h-screen bg-lol-bg font-spiegel text-lol-gold-bright antialiased before:pointer-events-none before:fixed before:inset-0 before:z-0 before:bg-rift'>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
        <DoorIntro />
      </body>
    </html>
  );
}
