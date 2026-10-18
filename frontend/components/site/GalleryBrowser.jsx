'use client';

import { useMemo, useState } from 'react';
import { Images } from 'lucide-react';
import { cn, humanize } from '@/lib/format';
import { GalleryLightbox } from './GalleryLightbox';

/**
 * Client-side gallery with category tabs that filter the shared lightbox grid.
 */
export function GalleryBrowser({ items = [] }) {
  const photos = useMemo(
    () =>
      items
        .filter((item) => item?.image?.url || item?.src)
        .map((item) => ({
          _id: item._id,
          src: item.image?.url || item.src,
          title: item.title,
          caption: item.caption,
          category: item.category,
        })),
    [items]
  );

  const categories = useMemo(() => {
    const set = new Set(photos.map((photo) => photo.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [photos]);

  const [active, setActive] = useState('all');
  const filtered = active === 'all' ? photos : photos.filter((photo) => photo.category === active);

  if (!photos.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Images className="h-6 w-6" />
        </span>
        <h3 className="text-base font-semibold text-slate-900">No photos yet</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">Gallery images will appear here once added.</p>
      </div>
    );
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                active === category
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {category === 'all' ? `All (${photos.length})` : humanize(category)}
            </button>
          ))}
        </div>
      )}

      <GalleryLightbox key={active} items={filtered} />
    </div>
  );
}
