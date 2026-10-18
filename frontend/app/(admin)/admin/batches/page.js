'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { useOptions } from '@/components/admin/useOptions';
import { COURSE_MODES, BATCH_STATUSES, WEEKDAYS, getStatusMeta } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminBatchesPage() {
  const courses = useOptions('/api/admin/courses');
  const trainers = useOptions('/api/admin/trainers');

  const fields = [
    { name: 'name', label: 'Batch name', type: 'text', required: true, span: 2 },
    { name: 'course', label: 'Course', type: 'select', required: true, options: courses },
    { name: 'trainer', label: 'Trainer', type: 'select', options: trainers, placeholder: 'Unassigned' },
    { name: 'mode', label: 'Mode', type: 'select', options: COURSE_MODES },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date', required: true },
    { name: 'startTime', label: 'Start time', type: 'text' },
    { name: 'endTime', label: 'End time', type: 'text' },
    { name: 'venue', label: 'Venue', type: 'text', span: 2 },
    { name: 'meetingLink', label: 'Meeting link', type: 'text', span: 2 },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'fee', label: 'Fee override', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: BATCH_STATUSES },
    { name: 'days', label: 'Days', type: 'multiselect', options: WEEKDAYS, span: 2 },
  ];

  const columns = [
    { key: 'name', header: 'Batch' },
    { key: 'startDate', header: 'Start date', render: (r) => formatDate(r.startDate) },
    { key: 'capacity', header: 'Capacity', render: (r) => `${r.enrolledCount || 0} / ${r.capacity}` },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={getStatusMeta(BATCH_STATUSES, r.status).tone}>{getStatusMeta(BATCH_STATUSES, r.status).label}</Badge> },
  ];

  return (
    <ResourceManager
      title="Batches"
      description="Schedule batches and manage capacity."
      endpoint="/api/admin/batches"
      itemLabel="batch"
      columns={columns}
      fields={fields}
      defaultValues={{ mode: 'offline', status: 'upcoming', capacity: 20, fee: 0 }}
      toForm={(r) => ({
        ...r,
        course: r.course?._id || r.course || '',
        trainer: r.trainer?._id || r.trainer || '',
        startDate: r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : '',
      })}
    />
  );
}
