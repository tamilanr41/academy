'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';

const ICON_OPTIONS = ['BookOpen', 'GraduationCap', 'Cpu', 'Palette', 'Languages', 'Briefcase', 'FlaskConical', 'Music', 'Camera', 'Code'].map((v) => ({ value: v, label: v }));

export default function AdminCategoriesPage() {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 1 },
    { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, placeholder: 'BookOpen' },
    { name: 'description', label: 'Description', type: 'textarea', span: 2 },
    { name: 'image', label: 'Cover image', type: 'file', folder: 'categories', span: 2 },
    { name: 'order', label: 'Sort order', type: 'number' },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (r) => <span className="line-clamp-1 max-w-xs text-slate-600">{r.description || '—'}</span> },
    { key: 'order', header: 'Order' },
    { key: 'isActive', header: 'Status', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Hidden'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Course Categories"
      description="Organise your catalogue into categories."
      endpoint="/api/admin/categories"
      itemLabel="category"
      columns={columns}
      fields={fields}
      defaultValues={{ icon: 'BookOpen', order: 0, isActive: true }}
      toForm={(r) => ({ ...r, image: r.image || { url: '', publicId: '' } })}
    />
  );
}
