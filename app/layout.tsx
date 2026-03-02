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

export const metadata: Metadata = {
  title: 'LoL 5vs5 내전 | 관악구 피바라기',
  description: 'MMR 기반 5:5 내전 팀 분배 · 역할 랜덤 배정',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className={`${cinzel.variable} ${notoSansKr.variable}`}>
      <body className='min-h-screen antialiased font-spiegel'>{children}</body>
    </html>
  );
}
