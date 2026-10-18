'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { PUBLIC_NAV } from '@/lib/constants';
import { cn, initials } from '@/lib/format';
import { Logo } from './Logo';
import { Button } from '@/components/ui/primitives';
import { clientPost } from '@/lib/client';
import { useLockBody } from '@/components/ui/Toast';

/**
 * Miranda-style header: solid full-width maroon bar, white Inter nav links
 * with a soft sliding indicator, and a blush "Apply now" pill CTA.
 */
export function Navbar({ settings, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [pill, setPill] = useState(null);
  useLockBody(open);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
    setHovered(null);
  }, [pathname]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const activeIndex = PUBLIC_NAV.findIndex((item) => isActive(item.href));
  const dashboardHref = user?.role && user.role !== 'student' ? '/admin' : '/dashboard';

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const index = hovered ?? activeIndex;
    const items = nav.querySelectorAll('[data-nav-item]');
    const target = index >= 0 ? items[index] : null;
    if (!target) {
      setPill(null);
      return;
    }
    setPill({ x: target.offsetLeft, width: target.offsetWidth });
  }, [hovered, activeIndex]);

  useEffect(() => {
    measure();
  }, [measure, pathname]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const logout = async () => {
    await clientPost('/api/auth/logout');
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-brand-600">
      <div className="container-page flex h-[72px] items-center justify-between gap-4 sm:h-20">
        <Logo settings={settings} textClassName="text-white" markClassName="bg-blush-300 text-brand-700" />

        <nav
          ref={navRef}
          aria-label="Primary"
          className="relative hidden items-center gap-1 self-stretch lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          <span
            aria-hidden
            className="nav-pill absolute bottom-2.5 top-2.5 rounded-full bg-white/12"
            style={
              pill
                ? { transform: `translate(${pill.x}px, 0)`, width: pill.width, opacity: 1 }
                : { transform: 'translate(-10px, 0)', width: 0, opacity: 0 }
            }
          />
          {PUBLIC_NAV.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHovered(index)}
                className={cn(
                  'relative z-10 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-white/75 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-white/25 py-1.5 pl-1.5 pr-3.5 transition hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-300 text-xs font-semibold text-brand-700">
                  {initials(user.name)}
                </span>
                <span className="text-sm font-medium text-white">{user.name?.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-white/60" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-brand-700 py-1.5 shadow-2xl">
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" /> {user.role === 'student' ? 'My Dashboard' : 'Admin Panel'}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-300 transition hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" className="btn-on-dark">
                Student Login
              </Button>
              <Button href="/apply" size="sm" className="btn-amber">
                Apply now
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full p-2 text-white transition hover:bg-white/10 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="pointer-events-auto fixed inset-0 z-[70] flex flex-col bg-brand-600 lg:hidden">
          <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
            <Logo settings={settings} textClassName="text-white" markClassName="bg-blush-300 text-brand-700" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-white transition hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label="Mobile" className="relative flex-1 overflow-y-auto px-5 pb-8">
            {PUBLIC_NAV.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={cn(
                    'flex animate-fade-up items-baseline gap-4 border-b border-white/15 py-4 text-2xl transition',
                    active ? 'text-white' : 'text-white/80 hover:text-white'
                  )}
                >
                  {item.label}
                  {active && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-blush-300" aria-hidden />}
                </Link>
              );
            })}

            <div className="mt-7 flex flex-col gap-3">
              {user ? (
                <>
                  <Button href={dashboardHref} size="sm" className="btn-on-dark w-full" onClick={() => setOpen(false)}>
                    {user.role === 'student' ? 'My Dashboard' : 'Admin Panel'}
                  </Button>
                  <Button variant="danger" size="sm" className="w-full" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/apply" size="sm" className="btn-amber w-full" onClick={() => setOpen(false)}>
                    Apply now
                  </Button>
                  <Button href="/login" variant="secondary" size="sm" className="w-full" onClick={() => setOpen(false)}>
                    Student Login
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
