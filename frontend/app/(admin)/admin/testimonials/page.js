'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { useOptions } from '@/components/admin/useOptions';

export default function AdminTestimonialsPage() {
  const courses = useOptions('/api/admin/courses');

  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'rating', label: 'Rating', type: 'number' },
    { name: 'content', label: 'Testimonial', type: 'textarea', required: true, rows: 4, span: 2 },
    { name: 'photo', label: 'Photo', type: 'file', folder: 'testimonials', aspect: 'aspect-square', span: 1 },
    { name: 'course', label: 'Related course', type: 'select', options: courses, placeholder: 'None' },
    { name: 'isApproved', label: 'Approved', type: 'checkbox' },
    { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
    { name: 'order', label: 'Sort order', type: 'number' },
  ];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'rating', header: 'Rating' },
    { key: 'isApproved', header: 'Approved', render: (r) => <Badge tone={r.isApproved ? 'success' : 'warning'}>{r.isApproved ? 'Yes' : 'No'}</Badge> },
    { key: 'isFeatured', header: 'Featured', render: (r) => <Badge tone={r.isFeatured ? 'brand' : 'neutral'}>{r.isFeatured ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Testimonials"
      description="Manage student and alumni testimonials."
      endpoint="/api/admin/testimonials"
      itemLabel="testimonial"
      columns={columns}
      fields={fields}
      defaultValues={{ rating: 5, isApproved: false, isFeatured: false, order: 0 }}
      toForm={(r) => ({
        ...r,
        course: r.course?._id || r.course || '',
        photo: r.photo || { url: '', publicId: '' },
      })}
    />
  );
}
