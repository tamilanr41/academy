'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { Card, CardHeader, CardBody, Spinner } from '@/components/ui/primitives';
import { PageHeader } from '@/components/dashboard/Shell';
import { formatNumber } from '@/lib/format';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    clientGet('/api/admin/dashboard/analytics').then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.ok) setData(result.data);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner /> <span className="ml-2 text-sm text-slate-500">Loading analytics…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-slate-600">Could not load analytics. Try refreshing the page.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Applications, signups, enrollments and course popularity." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Signups" />
          <CardBody>
            <div className="space-y-2">
              {(data.monthlySignups || []).map((row) => (
                <div key={row.month} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.month}</span>
                  <span className="font-semibold text-slate-900">{formatNumber(row.count)}</span>
                </div>
              ))}
              {!data.monthlySignups?.length && <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Applications" />
          <CardBody>
            <div className="space-y-2">
              {(data.monthlyApplications || []).map((row) => (
                <div key={row.month} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.month}</span>
                  <span className="font-semibold text-slate-900">{formatNumber(row.count)}</span>
                </div>
              ))}
              {!data.monthlyApplications?.length && <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Course popularity" />
          <CardBody>
            <div className="space-y-2">
              {(data.coursePopularity || []).map((row) => (
                <div key={row.courseId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.title}</span>
                  <span className="font-semibold text-slate-900">{formatNumber(row.applications)} applications</span>
                </div>
              ))}
              {!data.coursePopularity?.length && <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
