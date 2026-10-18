'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { COURSE_LEVELS, COURSE_MODES } from '@/lib/constants';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'fee_low', label: 'Fee: low to high' },
  { value: 'fee_high', label: 'Fee: high to low' },
  { value: 'title', label: 'Title A–Z' },
];

export function CourseFilters({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/courses?${params.toString()}`);
    setOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setParam('search', search.trim());
  };

  const clearAll = () => router.push('/courses');
  const activeCount = ['category', 'level', 'mode', 'minFee', 'maxFee', 'search'].filter((key) => searchParams.get(key)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses by name or skill…"
            className="input pl-10"
            aria-label="Search courses"
          />
        </form>
        <div className="flex gap-2">
          <select value={searchParams.get('sort') || 'newest'} onChange={(event) => setParam('sort', event.target.value)} className="input w-full sm:w-48" aria-label="Sort courses">
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setOpen((value) => !value)} className="btn btn-secondary shrink-0 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>

      <div className={`grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 ${open ? '' : 'hidden lg:grid'}`}>
        <FilterSelect label="Category" value={searchParams.get('category') || ''} onChange={(value) => setParam('category', value)} options={categories.map((c) => ({ value: c.slug, label: c.name }))} placeholder="All categories" />
        <FilterSelect label="Level" value={searchParams.get('level') || ''} onChange={(value) => setParam('level', value)} options={COURSE_LEVELS} placeholder="All levels" />
        <FilterSelect label="Mode" value={searchParams.get('mode') || ''} onChange={(value) => setParam('mode', value)} options={COURSE_MODES} placeholder="All modes" />
        <div>
          <span className="label">Max fee</span>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              defaultValue={searchParams.get('maxFee') || ''}
              onBlur={(event) => setParam('maxFee', event.target.value)}
              placeholder="Any"
              className="input"
              aria-label="Maximum fee"
            />
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="btn btn-ghost shrink-0 px-3" title="Clear filters" aria-label="Clear filters">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <span className="label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
