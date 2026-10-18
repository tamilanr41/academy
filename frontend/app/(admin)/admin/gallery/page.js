'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { GALLERY_CATEGORIES } from '@/lib/constants';

export default function AdminGalleryPage() {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true, span: 1 },
    { name: 'caption', label: 'Caption', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: GALLERY_CATEGORIES },
    { name: 'image', label: 'Image', type: 'file', folder: 'gallery', aspect: 'aspect-[4/3]', required: true, span: 2 },
    { name: 'order', label: 'Sort order', type: 'number' },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  const columns = [
    { key: 'image', header: 'Thumb', render: (r) => (
      r.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.image.url} alt={r.title} className="h-10 w-14 rounded-lg object-cover" />
      ) : <span className="text-xs text-slate-400">—</span>
    ) },
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    { key: 'isActive', header: 'Active', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Gallery"
      description="Manage photo gallery items."
      endpoint="/api/admin/gallery"
      itemLabel="gallery item"
      columns={columns}
      fields={fields}
      defaultValues={{ category: 'campus', isActive: true, order: 0 }}
      toForm={(r) => ({ ...r, image: r.image || { url: '', publicId: '' } })}
    />
  );
}
