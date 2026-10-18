import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getCurrentUser } from '@/lib/api';
import { Card, CardHeader, CardBody, Badge, Button, StatCard } from '@/components/ui/primitives';
import { PageHeader } from '@/components/dashboard/Shell';
import { formatDate, formatCurrency } from '@/lib/format';
import { ClipboardList, GraduationCap, CreditCard, Bell } from 'lucide-react';

export default async function DashboardOverview() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'student') redirect('/admin');

  const [apps, enrollments, payments, notifications] = await Promise.all([
    apiFetch('/api/student/applications/my?limit=5', { auth: true }),
    apiFetch('/api/student/enrollments/my?limit=5', { auth: true }),
    apiFetch('/api/student/payments/my?limit=5', { auth: true }),
    apiFetch('/api/student/notifications?limit=5', { auth: true }),
  ]);

  const appsCount = apps.meta?.total || (apps.data?.length || 0);
  const enrollCount = enrollments.meta?.total || (enrollments.data?.length || 0);
  const payCount = payments.meta?.total || (payments.data?.length || 0);
  const notifCount = notifications.meta?.total || (notifications.data?.length || 0);

  return (
    <div>
      <PageHeader title="My Dashboard" description={`Hi ${user.name}, track your applications, courses and payments.`} action={<Button href="/apply">Apply for a course</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={appsCount} icon={ClipboardList} />
        <StatCard label="Enrollments" value={enrollCount} icon={GraduationCap} />
        <StatCard label="Payments" value={payCount} icon={CreditCard} />
        <StatCard label="Notifications" value={notifCount} icon={Bell} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent applications" action={<Button href="/dashboard/applications" variant="ghost" size="sm">View all</Button>} />
          <CardBody className="space-y-2">
            {(apps.data||[]).map(a=> (
              <div key={a._id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{a.course?.title}</span>
                <Badge>{a.status}</Badge>
              </div>
            ))}
            {!apps.data?.length && <p className="text-sm text-slate-500">No applications yet.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent enrollments" action={<Button href="/dashboard/enrollments" variant="ghost" size="sm">View all</Button>} />
          <CardBody className="space-y-2">
            {(enrollments.data||[]).map(e=> (
              <div key={e._id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{e.course?.title}</span>
                <Badge>{e.status}</Badge>
              </div>
            ))}
            {!enrollments.data?.length && <p className="text-sm text-slate-500">No enrollments yet.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
