'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';

export function Tabs({ tabs = [], initial, onChange, className }) {
  const [active, setActive] = useState(initial || tabs[0]?.value);

  const select = (value) => {
    setActive(value);
    onChange?.(value);
  };

  return (
    <div className={cn('flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => select(tab.value)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-semibold transition',
            active === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 text-xs text-slate-400">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
