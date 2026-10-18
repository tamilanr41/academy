'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/format';
import { useLockBody } from '@/components/ui/Toast';
import { SmartImage } from './SmartImage';

/**
 * Masonry-style photo grid with a keyboard-navigable lightbox.
 * `items` is an array of `{ src, title, caption, category }`.
 */
export function GalleryLightbox({ items = [], columns = 3, className }) {
  const photos = useMemo(() => items.filter((item) => item?.src), [items]);
  const [index, setIndex] = useState(-1);
  const open = index >= 0;
  useLockBody(open);

  const close = useCallback(() => setIndex(-1), []);
  const next = useCallback(() => setIndex((value) => (value + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setIndex((value) => (value - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  const active = open ? photos[index] : null;

  return (
    <>
      <div className={cn('grid gap-4 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3', columns === 4 && 'lg:grid-cols-4', className)}>
        {photos.map((photo, i) => (
          <button
            key={photo._id || photo.title || i}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'group relative block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left shadow-sm transition hover:shadow-lg',
              i % 5 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
            )}
          >
            <div className={cn('relative', i % 5 === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
              <SmartImage
                src={photo.src}
                alt={photo.title || 'Gallery photo'}
                seed={photo.title || i}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
            {(photo.title || photo.category) && (
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block translate-y-2 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.title}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {open && active && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-900/92 p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" onClick={close}>
          <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <figure className="w-full max-w-4xl animate-scale-in" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
              <SmartImage src={active.src} alt={active.title || 'Gallery photo'} sizes="90vw" fill />
            </div>
            {(active.title || active.caption) && (
              <figcaption className="mt-4 text-center text-sm text-white/90">
                {active.title && <p className="text-base font-semibold">{active.title}</p>}
                {active.caption && <p className="mt-1 text-white/70">{active.caption}</p>}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
