import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { getSiteSettings } from '@/lib/site';
import { ADMIN_NAV } from '@/lib/constants';
import { DashboardShell } from '@/components/dashboard/Shell';

const ADMIN_ONLY = new Set(['/admin/users', '/admin/settings', '/admin/audit-logs']);

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role === 'student') redirect('/dashboard');

  const settings = await getSiteSettings();
  const isAdmin = ['super_admin', 'admin'].includes(user.role);

  const nav = ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => isAdmin || !ADMIN_ONLY.has(item.href)),
  })).filter((section) => section.items.length);

  const roleLabel = { super_admin: 'Super Admin', admin: 'Administrator', staff: 'Staff', trainer: 'Trainer' }[user.role] || 'Team';

  return (
    <DashboardShell nav={nav} user={user} brand={settings.academyName} roleLabel={roleLabel} accent="brand">
      {children}
    </DashboardShell>
  );
}
