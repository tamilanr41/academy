import { cn } from '@/lib/format';

/** Infinite, seamless marquee. Duplicates its children so the loop has no gap. */
export function Marquee({ items, className, itemClassName, reverse = false }) {
  const row = [...items, ...items];
  return (
    <div className={cn('mask-fade-x relative overflow-hidden', className)}>
      <div className={cn('flex w-max animate-marquee gap-10', reverse && '[animation-direction:reverse]')}>
        {row.map((item, index) => (
          <div key={`${item}-${index}`} className={cn('flex shrink-0 items-center', itemClassName)}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
