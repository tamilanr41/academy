'use client';

import { cn } from '@/lib/format';
import { Spinner } from './primitives';

/**
 * Lightweight generic table.
 * `columns` is an array of { key, header, render?, className?, headClassName? }.
 * `render(row)` receives the row and should return a node.
 */
export function DataTable({ columns, rows = [], loading, empty, getRowKey = (row) => row._id || row.id, onRowClick, className }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
        <Spinner /> Loading…
      </div>
    );
  }

  if (!rows.length) {
    return <div className="py-4">{empty}</div>;
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((column) => (
              <th key={column.key} className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', column.headClassName)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('border-b border-slate-100 last:border-0', onRowClick && 'cursor-pointer hover:bg-slate-50')}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3 align-middle text-slate-700', column.className)}>
                  {column.render ? column.render(row) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
