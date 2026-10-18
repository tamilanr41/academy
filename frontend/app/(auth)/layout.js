import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { getSiteSettings } from '@/lib/site';

export default async function AuthLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <header className="container-page flex h-16 items-center justify-between">
        <Logo settings={settings} />
        <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-700">
          ← Back to site
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container-page py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {settings.academyName}. All rights reserved.
      </footer>
    </div>
  );
}
