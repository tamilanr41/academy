'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SmartImage } from './SmartImage';

/**
 * Full-width image slideshow with circular arrows and bottom-center dots
 * (Miranda home page section 4).
 */
export function Slideshow({ slides, className = '' }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  const go = (delta) => setIndex((value) => (value + delta + count) % count);

  return (
    <div className={`relative aspect-[16/9] max-h-[560px] w-full overflow-hidden ${className}`}>
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== index}
        >
          <SmartImage
            src={slide.src}
            alt={slide.alt}
            sizes="100vw"
            priority={i === 0}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-blush-200 text-ink-900 transition hover:bg-blush-300 sm:left-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-blush-200 text-ink-900 transition hover:bg-blush-300 sm:right-6"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === index ? 'bg-white' : 'bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
