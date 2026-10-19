'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clientGet } from '@/lib/client';

const PROFILE_PATH = '/dashboard/profile';

/**
 * Module level cache so the completeness check runs once per session instead of
 * on every client side navigation inside the dashboard.
 */
let profileCompleteCache = null;

export function markProfileComplete(value = true) {
  profileCompleteCache = value;
}

/**
 * Forces students to finish their profile before using the rest of the
 * dashboard: anyone with an incomplete profile is bounced to the profile page.
 */
export default function ProfileGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(profileCompleteCache === null && pathname !== PROFILE_PATH);

  useEffect(() => {
    if (pathname === PROFILE_PATH) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    if (profileCompleteCache === true) {
      setChecking(false);
      return () => {
        active = false;
      };
    }

    setChecking(true);
    clientGet('/api/student/profile', { auth: true }).then((res) => {
      if (!active) return;
      if (res.ok && res.data) {
        profileCompleteCache = res.data.isComplete === true;
        if (!profileCompleteCache) {
          router.replace(`${PROFILE_PATH}?complete=1`);
          return;
        }
      }
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        Checking your profile…
      </div>
    </div>
  );
}
