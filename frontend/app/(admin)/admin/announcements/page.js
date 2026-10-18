'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ANNOUNCEMENT_AUDIENCES, PRIORITIES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminAnnouncementsPage() {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 4, span: 2 },
    { name: 'audience', label: 'Audience', type: 'select', options: ANNOUNCEMENT_AUDIENCES },
    { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES },
    { name: 'link', label: 'Link', type: 'text' },
    { name: 'linkLabel', label: 'Link label', type: 'text' },
    { name: 'publishAt', label: 'Publish at', type: 'date' },
    { name: 'expiresAt', label: 'Expires at', type: 'date' },
    { name: 'isPublished', label: 'Published', type: 'checkbox' },
  ];

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'audience', header: 'Audience' },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={r.priority === 'urgent' ? 'danger' : r.priority === 'normal' ? 'brand' : 'neutral'}>{r.priority}</Badge> },
    { key: 'isPublished', header: 'Published', render: (r) => <Badge tone={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Yes' : 'No'}</Badge> },
    { key: 'publishAt', header: 'Publish date', render: (r) => formatDate(r.publishAt) },
  ];

  return (
    <ResourceManager
      title="Announcements"
      description="Communicate updates to students and staff."
      endpoint="/api/admin/announcements"
      itemLabel="announcement"
      columns={columns}
      fields={fields}
      defaultValues={{ audience: 'all', priority: 'normal', isPublished: true }}
      toForm={(r) => ({
        ...r,
        publishAt: r.publishAt ? new Date(r.publishAt).toISOString().slice(0, 10) : '',
        expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString().slice(0, 10) : '',
      })}
    />
  );
}
