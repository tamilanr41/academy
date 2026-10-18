import Image from 'next/image';
import { cn } from '@/lib/format';

/**
 * Image with a graceful gradient fallback for items that have no uploaded
 * media (common with freshly seeded/demo content).
 */
export function SmartImage({ src, alt = '', className, sizes = '(max-width: 768px) 100vw, 33vw', priority, fill = true, seed = 0 }) {
  const url = typeof src === 'string' ? src : src?.url;

  if (!url) {
    const palettes = [
      'from-brand-500 to-indigo-700',
      'from-sky-500 to-blue-700',
      'from-emerald-500 to-teal-700',
      'from-amber-500 to-orange-700',
      'from-fuchsia-500 to-purple-700',
    ];
    const palette = palettes[Math.abs(String(seed).length + seed) % palettes.length];
    return (
      <div className={cn('flex items-center justify-center bg-gradient-to-br', palette, fill ? 'absolute inset-0' : 'h-full w-full', className)}>
        <span className="px-4 text-center text-sm font-bold uppercase tracking-wide text-white/85">{alt?.slice(0, 40)}</span>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : undefined}
      fetchPriority={priority ? 'high' : undefined}
      className={cn('object-cover', !fill && 'h-auto w-full', className)}
    />
  );
}
