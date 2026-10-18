'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { EVENT_CATEGORIES, COURSE_MODES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminEventsPage() {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 4, span: 2 },
    { name: 'image', label: 'Image', type: 'file', folder: 'events', aspect: 'aspect-video', span: 2 },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'mode', label: 'Mode', type: 'select', options: COURSE_MODES },
    { name: 'registrationUrl', label: 'Registration URL', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: EVENT_CATEGORIES },
    { name: 'seats', label: 'Seats', type: 'number' },
    { name: 'isPublished', label: 'Published', type: 'checkbox' },
  ];

  const columns = [
    { key: 'title', header: 'Event' },
    { key: 'category', header: 'Category' },
    { key: 'startDate', header: 'Start date', render: (r) => formatDate(r.startDate) },
    { key: 'isPublished', header: 'Published', render: (r) => <Badge tone={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Events"
      description="Manage workshops, seminars and campus events."
      endpoint="/api/admin/events"
      itemLabel="event"
      columns={columns}
      fields={fields}
      defaultValues={{ mode: 'offline', category: 'workshop', isPublished: false, seats: 0 }}
      toForm={(r) => ({
        ...r,
        image: r.image || { url: '', publicId: '' },
        startDate: r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : '',
      })}
    />
  );
}
