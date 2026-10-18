'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { useOptions } from '@/components/admin/useOptions';
import { COURSE_LEVELS, COURSE_MODES } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

export default function AdminCoursesPage() {
  const categories = useOptions('/api/admin/categories');
  const trainers = useOptions('/api/admin/trainers');

  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
    { name: 'category', label: 'Category', type: 'select', required: true, options: categories },
    { name: 'level', label: 'Level', type: 'select', options: COURSE_LEVELS, placeholder: 'Select level' },
    { name: 'mode', label: 'Mode', type: 'select', options: COURSE_MODES, placeholder: 'Select mode' },
    { name: 'shortDescription', label: 'Short description', type: 'textarea', rows: 2, span: 2 },
    { name: 'description', label: 'Full description', type: 'textarea', required: true, rows: 6, span: 2 },
    { name: 'durationText', label: 'Duration (text)', type: 'text' },
    { name: 'durationWeeks', label: 'Duration (weeks)', type: 'number' },
    { name: 'fee', label: 'Fee', type: 'number', required: true },
    { name: 'discountFee', label: 'Discount fee', type: 'number' },
    { name: 'seats', label: 'Seats', type: 'number' },
    { name: 'trainers', label: 'Trainers', type: 'multiselect', options: trainers, span: 2 },
    { name: 'image', label: 'Thumbnail', type: 'file', folder: 'courses', aspect: 'aspect-video', span: 1 },
    { name: 'banner', label: 'Banner', type: 'file', folder: 'courses', aspect: 'aspect-[16/5]', span: 1 },
    { name: 'videoUrl', label: 'Trailer video URL', type: 'text', span: 2, placeholder: 'YouTube, Vimeo or MP4 link (optional)' },
    { name: 'prerequisites', label: 'Prerequisites', type: 'tags', span: 2 },
    { name: 'learningOutcomes', label: 'Learning outcomes', type: 'tags', span: 2 },
    { name: 'tags', label: 'Tags', type: 'tags', span: 2 },
    {
      name: 'curriculum',
      label: 'Curriculum modules',
      type: 'repeater',
      span: 2,
      subfields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'duration', label: 'Duration', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ],
    },
    {
      name: 'faqs',
      label: 'FAQs',
      type: 'repeater',
      span: 2,
      subfields: [
        { name: 'question', label: 'Question', type: 'text', span: 2 },
        { name: 'answer', label: 'Answer', type: 'textarea', span: 2 },
      ],
    },
    { name: 'certificateProvided', label: 'Certificate provided', type: 'checkbox' },
    { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
    { name: 'isPublished', label: 'Published', type: 'checkbox' },
    { name: 'order', label: 'Sort order', type: 'number' },
  ];

  const columns = [
    { key: 'title', header: 'Course' },
    { key: 'level', header: 'Level', render: (r) => <Badge tone="info">{r.level || '—'}</Badge> },
    { key: 'mode', header: 'Mode', render: (r) => <Badge tone="neutral">{r.mode || '—'}</Badge> },
    { key: 'fee', header: 'Fee', render: (r) => formatCurrency(r.fee) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={r.isPublished ? 'success' : 'warning'}>{r.isPublished ? 'Published' : 'Draft'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Courses"
      description="Manage the full course catalogue."
      endpoint="/api/admin/courses"
      itemLabel="course"
      searchable
      filters={[
        { name: 'status', label: 'Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
        { name: 'level', label: 'Level', options: COURSE_LEVELS },
        { name: 'mode', label: 'Mode', options: COURSE_MODES },
      ]}
      columns={columns}
      fields={fields}
      defaultValues={{ level: 'beginner', mode: 'offline', fee: 0, discountFee: 0, seats: 30, certificateProvided: true, isPublished: false, order: 0 }}
      toForm={(r) => ({
        ...r,
        category: r.category?._id || r.category || '',
        trainers: (r.trainers || []).map((t) => t._id || t),
        image: r.image || { url: '', publicId: '' },
        banner: r.banner || { url: '', publicId: '' },
        prerequisites: r.prerequisites || [],
        learningOutcomes: r.learningOutcomes || [],
        curriculum: (r.curriculum || []).map((m) => ({ title: m.title || '', duration: m.duration || '', description: m.description || '' })),
        faqs: (r.faqs || []).map((f) => ({ question: f.question || '', answer: f.answer || '' })),
        tags: r.tags || [],
      })}
    />
  );
}
