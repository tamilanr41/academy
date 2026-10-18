'use client';

import { cn } from '@/lib/format';
import { parseVideo } from '@/lib/video';

/**
 * Full-bleed hero backdrop.
 *
 * If a background video URL is configured we play it muted/looping; otherwise
 * we render a premium animated fallback (mesh gradient + drifting blobs + a
 * slow Ken-Burns image) so the hero always feels alive without any media file.
 */
export function VideoBackdrop({ videoUrl, image, className }) {
  const parsed = parseVideo(videoUrl);
  const isEmbed = parsed && (parsed.type === 'youtube' || parsed.type === 'vimeo');

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {parsed && isEmbed ? (
        <div className="pointer-events-none absolute inset-0">
          <iframe
            src={parsed.background}
            title="Background video"
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : parsed && parsed.type === 'file' ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={parsed.background}
          poster={image}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
          )}
          <div className="mesh absolute inset-0 opacity-90" />
        </>
      )}

      {/* Drifting accent blobs */}
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl animate-blob" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl animate-blob [animation-delay:4s]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl animate-blob [animation-delay:8s]" />

      {/* Readability + texture overlays */}
      <div className="absolute inset-0 grid-pattern opacity-40 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900/92 via-ink-900/75 to-ink-800/85" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900 to-transparent" />
    </div>
  );
}
