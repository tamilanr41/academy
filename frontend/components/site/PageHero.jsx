import { cn } from '@/lib/format';

/**
 * Miranda-style inner page hero: flat blush background, near-black serif
 * heading, soft grey subtitle. No dark imagery.
 */
export function PageHero({ eyebrow, title, description, image, align = 'left', children, className }) {
  return (
    <section className={cn('relative overflow-hidden bg-blush-200', className)}>
      <div className={cn('container-page relative py-14 sm:py-20', align === 'center' && 'text-center')}>
        {eyebrow && <span className="sticker sticker-accent">{eyebrow}</span>}
        <h1
          className={cn(
            'mt-6 max-w-3xl text-4xl leading-[1.15] text-balance text-ink-900 sm:text-5xl lg:text-[3.5rem]',
            align === 'center' && 'mx-auto'
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={cn('mt-5 max-w-2xl text-lg leading-relaxed text-slate-600', align === 'center' && 'mx-auto')}>
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
