'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { cn, humanize } from '@/lib/format';

/**
 * Searchable, grouped FAQ accordion. FAQ fields: { question, answer, category }.
 */
export function FaqAccordion({ faqs = [] }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(faqs.map((faq) => faq.category || 'General'));
    return ['all', ...Array.from(set)];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || (faq.category || 'General') === activeCategory;
      const matchesQuery = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [faqs, query, activeCategory]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, faq) => {
      const key = faq.category || 'General';
      acc[key] = acc[key] || [];
      acc[key].push(faq);
      return acc;
    }, {});
  }, [filtered]);

  if (!faqs.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <HelpCircle className="h-6 w-6" />
        </span>
        <h3 className="text-base font-semibold text-slate-900">No FAQs published yet</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">Please contact us directly and we&apos;ll be happy to help.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions…"
            className="input pl-10"
            aria-label="Search FAQs"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  activeCategory === category ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {category === 'all' ? 'All' : humanize(category)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-10 space-y-10">
        {Object.keys(grouped).length ? (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-600">{humanize(category)}</h2>
              <div className="mt-4 space-y-3">
                {items.map((faq) => (
                  <details key={faq._id || faq.question} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-brand-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
            <p className="font-semibold text-slate-900">No matching questions</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
