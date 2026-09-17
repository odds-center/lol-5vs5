'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { LazyMotion, m } from 'motion/react';
import { INTRO_SEEN_KEY } from '@/lib/intro';
import { cn } from '@/lib/utils';

const loadFeatures = () => import('@/lib/motionFeatures').then((mod) => mod.default);

/** 문이 열리는 이징 (천천히 시작 → 빠르게 → 부드럽게 멈춤) */
const DOOR_EASE = [0.76, 0, 0.24, 1] as const;
const DOOR_DELAY = 1.1;
const DOOR_DURATION = 1;

const doorClass =
  'absolute inset-y-0 w-1/2 overflow-hidden border-lol-gold/70 from-[#04070d] via-lol-bg-card to-lol-card';

function DoorPanel({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <>
      {/* 금테 안쪽 프레임 */}
      <div className='absolute inset-4 rounded-sm border border-lol-gold/20 sm:inset-8' />
      <div className='absolute inset-7 rounded-sm border border-lol-gold/10 sm:inset-12' />
      {/* 가운데 이음새 쪽 은은한 금빛 */}
      <div
        className={cn(
          'absolute inset-0 from-lol-gold/10 to-transparent to-60%',
          isLeft ? 'bg-gradient-to-l' : 'bg-gradient-to-r',
        )}
      />
      {/* 가로 장식 띠 */}
      {['top-[22%]', 'bottom-[22%]'].map((pos) => (
        <div
          key={pos}
          className={cn(
            'absolute h-px w-2/3 from-transparent to-lol-gold/40',
            pos,
            isLeft ? 'right-0 bg-gradient-to-r' : 'left-0 bg-gradient-to-l',
          )}
        />
      ))}
    </>
  );
}

/**
 * 첫 방문 시 LoL 클라이언트 느낌의 금테 문이 양옆으로 열리며 사이트를 보여준다.
 * 서버에서 닫힌 문을 렌더링해 두고(html[data-intro]일 때만 표시) 마운트 후 연다.
 */
export default function DoorIntro() {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');

  const finish = useCallback(() => {
    document.documentElement.removeAttribute('data-intro');
    setPhase('done');
  }, []);

  useEffect(() => {
    if (!document.documentElement.hasAttribute('data-intro')) {
      setPhase('done');
      return;
    }
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // 저장 불가 환경에서는 다음 방문에도 인트로가 나올 뿐
    }
    setPhase('opening');
  }, []);

  if (phase === 'done') return null;
  const opening = phase === 'opening';

  return (
    <LazyMotion features={loadFeatures} strict>
      <div
        aria-hidden
        onClick={finish}
        // JS가 늦거나 실패해도 문이 영원히 닫혀 있지 않도록 6초 뒤 CSS로 숨김
        className='fixed inset-0 z-[200] hidden animate-intro-failsafe cursor-pointer overflow-hidden [perspective:1400px] [html[data-intro]_&]:block'
      >
        <m.div
          className={cn(doorClass, 'left-0 origin-left border-r bg-gradient-to-r')}
          initial={false}
          animate={opening ? { x: '-100%', rotateY: 18 } : undefined}
          transition={{ delay: DOOR_DELAY, duration: DOOR_DURATION, ease: DOOR_EASE }}
          onAnimationComplete={finish}
        >
          <DoorPanel side='left' />
        </m.div>
        <m.div
          className={cn(doorClass, 'right-0 origin-right border-l bg-gradient-to-l')}
          initial={false}
          animate={opening ? { x: '100%', rotateY: -18 } : undefined}
          transition={{ delay: DOOR_DELAY, duration: DOOR_DURATION, ease: DOOR_EASE }}
        >
          <DoorPanel side='right' />
        </m.div>

        {/* 이음새 빛: 세로로 번쩍인 뒤 문이 열리며 퍼짐 */}
        <m.div
          className='absolute inset-y-0 left-[calc(50%-1px)] w-0.5 bg-lol-gold-bright shadow-[0_0_24px_6px_rgba(232,213,163,0.55)]'
          initial={false}
          animate={opening ? { scaleY: [0.2, 1, 1], scaleX: [1, 1, 40], opacity: [0, 1, 0] } : undefined}
          transition={{ delay: 0.2, duration: DOOR_DELAY + 0.5, times: [0, 0.45, 1], ease: 'easeInOut' }}
          style={{ opacity: 0 }}
        />

        {/* 가운데 엠블럼 */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <m.div
            className='flex flex-col items-center gap-5'
            initial={false}
            animate={opening ? { scale: [1, 1.08, 0.7], opacity: [1, 1, 0] } : undefined}
            transition={{ delay: 0.1, duration: DOOR_DELAY, times: [0, 0.6, 1], ease: 'easeInOut' }}
          >
            <div className='relative rounded-full border-2 border-lol-gold bg-lol-bg p-1.5 shadow-[0_0_40px_rgba(200,170,110,0.35)]'>
              <div className='overflow-hidden rounded-full border border-lol-gold/40'>
                <Image
                  src='/logo-512.png'
                  alt=''
                  width={128}
                  height={128}
                  loading='eager'
                  className='h-24 w-24 object-cover sm:h-32 sm:w-32'
                />
              </div>
            </div>
            <p className='border-y border-lol-gold/30 bg-lol-card px-5 py-1 font-cinzel text-lg font-bold uppercase tracking-[0.3em] text-lol-gold sm:text-2xl'>
              LoL 5vs5
            </p>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
