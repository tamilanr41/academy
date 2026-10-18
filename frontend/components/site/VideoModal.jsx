'use client';

import { useCallback, useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/format';
import { useLockBody } from '@/components/ui/Toast';
import { SmartImage } from './SmartImage';
import { VideoPlayer } from './VideoPlayer';

/**
 * A poster tile with a play button that opens a full-screen video modal.
 * When no URL is supplied the trigger is disabled and the poster is shown as a
 * plain image so the layout still looks complete.
 */
export function VideoModal({
  url,
  poster,
  alt = 'Watch the video',
  title = 'Watch the video',
  autoplay = false,
  posterPriority = false,
  className,
  posterClassName,
  rounded = 'rounded-3xl',
  tone = 'brand',
  children,
}) {
  const [open, setOpen] = useState(false);
  useLockBody(open);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const clickable = Boolean(url);

  return (
    <>
      <button
        type="button"
        onClick={() => clickable && setOpen(true)}
        disabled={!clickable}
        aria-label={title}
        className={cn(
          'group relative block w-full overflow-hidden text-left',
          rounded,
          clickable ? 'cursor-pointer' : 'cursor-default',
          className
        )}
      >
        <div className={cn('relative aspect-video w-full', rounded, posterClassName)}>
          <SmartImage src={poster} alt={alt} sizes="(max-width: 1024px) 100vw, 60vw" priority={posterPriority} className="transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent" />
        </div>

        {clickable && (
          <>
            <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-700 shadow-2xl transition group-hover:scale-110 sm:h-20 sm:w-20">
                <span
                  className={cn(
                    'absolute inset-0 rounded-full animate-pulse-ring',
                    tone === 'light' ? 'bg-white/60' : 'bg-white/70'
                  )}
                />
                <Play className="relative ml-0.5 h-7 w-7 fill-current sm:h-8 sm:w-8" />
              </span>
            </span>
            {children && <span className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">{children}</span>}
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-900/85 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-full max-w-4xl animate-scale-in" onClick={(event) => event.stopPropagation()}>
            <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
              <VideoPlayer url={url} poster={poster} autoPlay={autoplay} controls className="aspect-video" title={title} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
