'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_AUDIENCES, PRIORITIES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminFaqsPage() {
  const fields = [
    { name: 'question', label: 'Question', type: 'text', required: true, span: 2 },
    { name: 'answer', label: 'Answer', type: 'textarea', required: true, rows: 4, span: 2 },
    { name: 'category', label: 'Category', type: 'select', options: ANNOUNCEMENT_CATEGORIES },
    { name: 'order', label: 'Sort order', type: 'number' },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  const columns = [
    { key: 'question', header: 'Question', render: (r) => <span className="line-clamp-1 max-w-sm">{r.question}</span> },
    { name: 'category', key: 'category', header: 'Category' },
    { name: 'isActive', key: 'isActive', header: 'Active', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <ResourceManager
      title="FAQs"
      description="Manage frequently asked questions."
      endpoint="/api/admin/faqs"
      itemLabel="FAQ"
      columns={columns}
      fields={fields}
      defaultValues={{ category: 'general', isActive: true, order: 0 }}
    />
  );
}
