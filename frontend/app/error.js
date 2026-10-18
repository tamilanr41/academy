'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl font-extrabold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">An unexpected error occurred.</p>
      <div className="mt-4 flex gap-3">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.push('/')}>
          Go home
        </button>
      </div>
    </div>
  );
}
