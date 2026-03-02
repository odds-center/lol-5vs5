import type { Metadata } from 'next';
import { Cinzel, Noto_Sans_KR } from 'next/font/google';
import './globals.css';

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

const SITE_NAME = 'LoL 5vs5 내전 | 관악구 피바라기';
const SITE_DESC =
  '롤 내전 팀 나누기, MMR 밸런스 팀 분배, 역할 랜덤 배정. 롤 팀 정하기·랜덤 팀 나누기 무료 도구.';
const KEYWORDS = [
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

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: KEYWORDS,
  authors: [{ name: '관악구 피바라기' }],
  creator: '관악구 피바라기',
  icons: { icon: '/logo.png' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: SITE_NAME,
    description: SITE_DESC,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESC,
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
  name: SITE_NAME,
  description: SITE_DESC,
  applicationCategory: 'GameApplication',
  keywords: KEYWORDS.join(', '),
  inLanguage: 'ko',
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
        {children}
      </body>
    </html>
  );
}
