import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getCurrentUser } from '@/lib/api';
import { Card, CardHeader, CardBody, Badge, Button, StatCard, EmptyState } from '@/components/ui/primitives';
import { PageHeader } from '@/components/dashboard/Shell';
import { APPLICATION_STATUSES, ENQUIRY_STATUSES, getStatusMeta } from '@/lib/constants';
import { formatDate, formatCurrency, humanize } from '@/lib/format';
import { ClipboardList, GraduationCap, Users, CreditCard, MessageSquare, CalendarClock } from 'lucide-react';

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'student') redirect('/dashboard');

  const statsRes = await apiFetch('/api/admin/dashboard/stats', { auth: true });
  const stats = statsRes.ok
    ? statsRes.data
    : {
        totalStudents: 0,
        activeCourses: 0,
        totalApplications: 0,
        pendingApplications: 0,
        totalEnquiries: 0,
        openEnquiries: 0,
        upcomingBatches: 0,
        activeEnrollments: 0,
        totalTrainers: 0,
        revenue: 0,
        paymentCount: 0,
        recentApplications: [],
        recentEnquiries: [],
        applicationStatus: [],
      };

  const apps = stats.recentApplications || [];
  const enqs = stats.recentEnquiries || [];

  return (
    <div>
      <PageHeader
        title="Dashboard overview"
        description={`Welcome back, ${user.name}. Here’s a snapshot of your academy.`}
        action={<Button href="/admin/applications">View applications</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={stats.totalStudents} icon={Users} tone="brand" />
        <StatCard label="Active courses" value={stats.activeCourses} icon={GraduationCap} />
        <StatCard label="Applications (pending)" value={stats.pendingApplications} icon={ClipboardList} />
        <StatCard label="Active enrollments" value={stats.activeEnrollments} icon={GraduationCap} />
        <StatCard label="Open enquiries" value={stats.openEnquiries} icon={MessageSquare} />
        <StatCard label="Upcoming batches" value={stats.upcomingBatches} icon={CalendarClock} />
        <StatCard label="Revenue (paid)" value={formatCurrency(stats.revenue)} icon={CreditCard} />
        <StatCard label="Trainers" value={stats.totalTrainers} icon={Users} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent applications"
            description="Latest submissions requiring attention."
            action={<Button href="/admin/applications" variant="ghost" size="sm">View all</Button>}
          />
          <CardBody>
            {apps.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Ref</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((a) => (
                      <tr key={a._id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 font-medium text-slate-700">{a.referenceNumber}</td>
                        <td className="px-3 py-2">{a.name}</td>
                        <td className="px-3 py-2">{a.course?.title || '—'}</td>
                        <td className="px-3 py-2">
                          <Badge tone={getStatusMeta(APPLICATION_STATUSES, a.status).tone}>{humanize(a.status)}</Badge>
                        </td>
                        <td className="px-3 py-2">{formatDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No applications yet" description="New applications will appear here." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent enquiries"
            description="New leads from the contact and enquiry forms."
            action={<Button href="/admin/enquiries" variant="ghost" size="sm">View all</Button>}
          />
          <CardBody>
            {enqs.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enqs.map((e) => (
                      <tr key={e._id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2">{e.name}</td>
                        <td className="px-3 py-2"><span className="line-clamp-1 max-w-xs">{e.subject}</span></td>
                        <td className="px-3 py-2">
                          <Badge tone={getStatusMeta(ENQUIRY_STATUSES, e.status).tone}>{humanize(e.status)}</Badge>
                        </td>
                        <td className="px-3 py-2">{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No enquiries yet" description="Recent enquiries will appear here." />
            )}
          </CardBody>
        </Card>
      </div>

      {stats.applicationStatus?.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Application pipeline" description="Distribution by current status." />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {stats.applicationStatus.map((row) => {
                const meta = getStatusMeta(APPLICATION_STATUSES, row.status);
                return (
                  <Badge key={row.status} tone={meta.tone}>
                    {humanize(row.status)}: {row.count}
                  </Badge>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
