'use client';

import { useTranslation } from '@/components/LanguageProvider';
import { GUIDE } from '@/lib/seo';

const sectionTitleClass =
  'mb-4 border-l-4 border-lol-gold pl-3 font-cinzel text-base font-bold uppercase tracking-wider text-lol-gold';

/**
 * 도구 아래 사용 가이드·기능·FAQ. 마운트 전에도 서버에서 렌더링되어
 * JS를 실행하지 않는 크롤러(네이버 Yeti 등)도 본문 키워드를 읽을 수 있다.
 */
export default function GuideSection() {
  const { locale } = useTranslation();
  const guide = GUIDE[locale];

  return (
    <section
      aria-labelledby='guide-heading'
      className='mx-auto w-full max-w-6xl px-4 pb-12 text-sm leading-relaxed text-lol-muted sm:px-6'
    >
      <div className='rounded-xl border border-lol-border bg-lol-bg-card/80 p-5 sm:p-8'>
        <h2
          id='guide-heading'
          className='font-cinzel text-xl font-bold tracking-wider text-lol-gold sm:text-2xl'
        >
          {guide.heading}
        </h2>
        <p className='mt-3 max-w-3xl'>{guide.intro}</p>

        <div className='mt-8 grid gap-8 lg:grid-cols-2'>
          <div>
            <h3 className={sectionTitleClass}>{guide.stepsTitle}</h3>
            <ol className='space-y-3'>
              {guide.steps.map((step, i) => (
                <li key={i} className='flex gap-3'>
                  <span className='inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-lol-card/80 text-xs text-lol-gold'>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className={sectionTitleClass}>{guide.featuresTitle}</h3>
            <dl className='space-y-3'>
              {guide.features.map(({ title, body }) => (
                <div key={title} className='rounded-lg border border-lol-border/60 bg-lol-card/40 p-3'>
                  <dt className='font-semibold text-lol-gold-bright'>{title}</dt>
                  <dd className='mt-1'>{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className='mt-8'>
          <h3 className={sectionTitleClass}>{guide.faqTitle}</h3>
          <div className='divide-y divide-lol-border/60 rounded-lg border border-lol-border/60 bg-lol-card/40'>
            {guide.faq.map(({ question, answer }) => (
              <details key={question} className='group px-4 py-3'>
                <summary className='flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-lol-gold-bright [&::-webkit-details-marker]:hidden'>
                  {question}
                  <span className='shrink-0 text-lol-muted transition-transform group-open:rotate-180' aria-hidden>
                    ▼
                  </span>
                </summary>
                <p className='mt-2'>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
