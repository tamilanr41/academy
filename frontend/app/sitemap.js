import { apiFetch, SITE_URL } from '@/lib/api';

export default async function Sitemap() {
  const base = SITE_URL;
  const res = await apiFetch('/api/courses');
  const courses = res.ok ? res.data || [] : [];
  const trRes = await apiFetch('/api/trainers');
  const trainers = trRes.ok ? trRes.data || [] : [];
  const staticRoutes = ['', '/about', '/courses', '/trainers', '/events', '/gallery', '/testimonials', '/contact', '/faq', '/privacy', '/terms', '/apply', '/login', '/register'].map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));

  const courseRoutes = courses.map((c) => ({
    url: `${base}/courses/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));
  const trainerRoutes = trainers.map((t) => ({
    url: `${base}/trainers/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...trainerRoutes];
}
