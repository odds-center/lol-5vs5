'use client';

import { useTranslation } from '@/components/LanguageProvider';
import { getBotInviteUrl } from '@/lib/discord';
import { buttonSecondaryClass } from '@/lib/styles';
import { cn } from '@/lib/utils';

/**
 * 내전 봇을 디스코드 서버에 추가하는 링크.
 * NEXT_PUBLIC_DISCORD_APP_ID가 없으면 아무것도 렌더링하지 않는다.
 */
export default function DiscordInviteButton() {
  const { t } = useTranslation();
  const inviteUrl = getBotInviteUrl();
  if (!inviteUrl) return null;

  return (
    <div className='flex flex-col items-center gap-1.5 pt-1'>
      <a
        href={inviteUrl}
        target='_blank'
        rel='noopener noreferrer'
        className={cn(buttonSecondaryClass, 'inline-flex items-center gap-2 rounded-lg py-2.5')}
      >
        {/* 디스코드 마크 */}
        <svg viewBox='0 0 24 24' aria-hidden className='h-4 w-4 fill-current'>
          <path d='M20.317 4.369A19.79 19.79 0 0 0 15.432 3c-.21.375-.455.88-.624 1.28a18.27 18.27 0 0 0-5.616 0A12.6 12.6 0 0 0 8.56 3a19.74 19.74 0 0 0-4.885 1.37C.567 9.045-.32 13.58.126 18.057a19.9 19.9 0 0 0 6.032 3.03c.487-.66.92-1.36 1.293-2.096a12.9 12.9 0 0 1-2.036-.977c.171-.125.338-.255.5-.389a14.2 14.2 0 0 0 12.17 0c.163.134.33.264.5.389-.65.382-1.332.71-2.04.978a15.9 15.9 0 0 0 1.293 2.095 19.86 19.86 0 0 0 6.036-3.03c.523-5.19-.894-9.684-3.557-13.688ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.42 0-1.332.953-2.42 2.157-2.42 1.213 0 2.177 1.095 2.157 2.42 0 1.335-.953 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.332.952-2.42 2.157-2.42 1.213 0 2.176 1.095 2.156 2.42 0 1.335-.943 2.42-2.156 2.42Z' />
        </svg>
        {t('discordInvite')}
      </a>
      <p className='text-center text-xs text-lol-muted'>{t('discordInviteHint')}</p>
    </div>
  );
}
