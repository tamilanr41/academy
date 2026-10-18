'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/format';
import { parseVideo } from '@/lib/video';

/**
 * Renders a YouTube/Vimeo embed or a native <video> element.
 * For direct files it adds custom play/pause and mute controls plus a poster.
 */
export function VideoPlayer({ url, poster, autoPlay = false, muted = false, loop = false, controls = false, className, title = 'Video' }) {
  const parsed = parseVideo(url);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    node.muted = isMuted;
  }, [isMuted]);

  if (!parsed) return null;

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <div className={cn('relative aspect-video w-full overflow-hidden', className)}>
        <iframe
          src={autoPlay ? parsed.background : parsed.embed}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (parsed.type === 'iframe') {
    return (
      <div className={cn('relative aspect-video w-full overflow-hidden', className)}>
        <iframe src={parsed.src} title={title} className="absolute inset-0 h-full w-full" allowFullScreen loading="lazy" />
      </div>
    );
  }

  const toggle = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      node.play().catch(() => {});
      setPlaying(true);
    } else {
      node.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn('group/video relative aspect-video w-full overflow-hidden bg-slate-900', className)}>
      <video
        ref={videoRef}
        src={parsed.src}
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {(controls || !autoPlay) && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-900/80 to-transparent p-3 opacity-0 transition group-hover/video:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow hover:bg-white"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMuted((value) => !value)}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
