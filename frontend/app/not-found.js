import Link from 'next/link';
import { Button } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-black text-brand-600">404</span>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-6">
        <Button href="/">Back to home</Button>
      </div>
    </div>
  );
}
