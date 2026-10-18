import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { getSiteSettings } from '@/lib/site';
import { STUDENT_NAV } from '@/lib/constants';
import { DashboardShell } from '@/components/dashboard/Shell';

export default async function StudentLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');
  if (user.role !== 'student') redirect('/admin');

  const settings = await getSiteSettings();

  return (
    <DashboardShell nav={STUDENT_NAV} user={user} brand={settings.academyName} roleLabel="Student" accent="slate">
      {children}
    </DashboardShell>
  );
}
