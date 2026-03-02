import type { Metadata } from 'next';
import { Cinzel, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';

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

const SITE_NAME_KO = 'LoL 5vs5 내전 | 관악구 피바라기';
const SITE_NAME_EN = 'LoL 5v5 In-house | Team Split & Random Roles';
const SITE_DESC_KO =
  '롤 내전 팀 나누기, MMR 밸런스 팀 분배, 역할 랜덤 배정. 롤 팀 정하기·랜덤 팀 나누기 무료 도구.';
const SITE_DESC_EN =
  'LoL in-house team split by MMR, random role assignment. Free tool for 5v5 custom games.';
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
];
const KEYWORDS = [...KEYWORDS_KO, ...KEYWORDS_EN];

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME_KO} | ${SITE_NAME_EN}`,
    template: `%s | LoL 5vs5`,
  },
  description: `${SITE_DESC_KO} ${SITE_DESC_EN}`,
  keywords: KEYWORDS,
  authors: [{ name: '관악구 피바라기' }],
  creator: '관악구 피바라기',
  icons: { icon: '/logo.png' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    title: SITE_NAME_KO,
    description: SITE_DESC_KO,
    siteName: SITE_NAME_KO,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME_KO,
    description: SITE_DESC_KO,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME_KO,
  alternateName: SITE_NAME_EN,
  description: SITE_DESC_KO,
  applicationCategory: 'GameApplication',
  keywords: KEYWORDS.join(', '),
  inLanguage: ['ko', 'en'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className={`${cinzel.variable} ${notoSansKr.variable}`}>
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
