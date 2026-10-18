'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';

export default function AdminTrainersPage() {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 1 },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'experienceYears', label: 'Experience (years)', type: 'number' },
    { name: 'order', label: 'Sort order', type: 'number' },
    { name: 'photo', label: 'Photo', type: 'file', folder: 'trainers', aspect: 'aspect-square', span: 1 },
    { name: 'qualifications', label: 'Qualifications', type: 'tags', span: 1 },
    { name: 'specializations', label: 'Specializations', type: 'tags', span: 2 },
    { name: 'bio', label: 'Bio', type: 'textarea', rows: 4, span: 2 },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'text', span: 1 },
    { name: 'website', label: 'Website', type: 'text', span: 1 },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'experienceYears', header: 'Experience' },
    { key: 'isActive', header: 'Status', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Trainers"
      description="Manage faculty profiles."
      endpoint="/api/admin/trainers"
      itemLabel="trainer"
      columns={columns}
      fields={fields}
      defaultValues={{ isActive: true, order: 0 }}
      toForm={(r) => ({
        ...r,
        linkedin: r.social?.linkedin || '',
        website: r.social?.website || '',
        photo: r.photo || { url: '', publicId: '' },
        qualifications: r.qualifications || [],
        specializations: r.specializations || [],
      })}
      fromForm={(p) => ({
        ...p,
        social: { linkedin: p.linkedin || '', website: p.website || '' },
      })}
    />
  );
}
