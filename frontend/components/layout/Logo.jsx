import Link from 'next/link';
import { cn } from '@/lib/format';

export function Logo({ settings, className, textClassName, markClassName }) {
  const url = settings?.logo?.url;
  const name = settings?.academyName || 'Academy';
  return (
    <Link href="/" className={cn('group flex items-center gap-2.5', className)} aria-label={name}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-14 w-auto object-contain" />
      ) : (
        <span
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-lg text-sm font-black transition',
            markClassName || 'bg-gradient-to-br from-brand-600 to-brand-700 text-white'
          )}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className={cn('text-base font-black uppercase tracking-tight text-slate-900', textClassName)}>{name}</span>
    </Link>
  );
}
