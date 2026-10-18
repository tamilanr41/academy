'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';

/**
 * Pagination control. Works in two modes:
 *  - controlled: pass `onPageChange`
 *  - URL-driven: omit `onPageChange` and it updates the `page` search param.
 */
export function Pagination({ meta, onPageChange, param = 'page', className }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!meta || meta.totalPages <= 1) return null;
  const { page = 1, totalPages = 1 } = meta;

  const goTo = (next) => {
    if (next < 1 || next > totalPages) return;
    if (onPageChange) {
      onPageChange(next);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, String(next));
    router.push(`?${params.toString()}`, { scroll: true });
  };

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className={cn('flex items-center justify-between gap-3 pt-4', className)} aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-700">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages[0] > 1 && <span className="px-1 text-slate-400">…</span>}
        {pages.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => goTo(number)}
            className={cn(
              'h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition',
              number === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {number}
          </button>
        ))}
        {end < totalPages && <span className="px-1 text-slate-400">…</span>}
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
