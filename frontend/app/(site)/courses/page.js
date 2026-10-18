import { Suspense } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { buildQuery } from '@/lib/format';
import { SectionHeading, EmptyState, Button } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { CourseCard } from '@/components/site/Cards';
import { CourseFilters } from '@/components/site/CourseFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Reveal } from '@/components/site/Reveal';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Courses',
  description: 'Browse our full catalogue of mentor-led courses across design, development, data and business.',
};

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;
  const query = buildQuery({
    search: params.search,
    category: params.category,
    level: params.level,
    mode: params.mode,
    minFee: params.minFee,
    maxFee: params.maxFee,
    sort: params.sort,
    page: params.page,
    limit: 9,
  });

  const [coursesRes, categories] = await Promise.all([
    safeGet(`/api/courses${query}`, { items: [], meta: null }, { revalidate: 60 }),
    safeGet('/api/categories', [], { revalidate: 300 }),
  ]);

  const courses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.items || [];
  const total = coursesRes?.meta?.total ?? courses.length;
  const hasFilters = Boolean(params.search || params.category || params.level || params.mode || params.minFee || params.maxFee);

  return (
    <div>
      <PageHero
        eyebrow="Course catalogue"
        title="Courses built for real outcomes"
        description="Filter by track, level, format or budget to find the program that fits your goals."
        image={IMAGES.library}
      />

      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="Explore"
            title={hasFilters ? 'Filtered results' : 'All courses'}
            description={`${total} ${total === 1 ? 'course' : 'courses'} available`}
          />
        </div>

        <div className="mt-8">
          <Suspense fallback={<div className="h-28" />}>
            <CourseFilters categories={categories} />
          </Suspense>
        </div>

        <div className="mt-10">
          {courses.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                  <Reveal key={course._id} delay={(index % 3) * 80}>
                    <CourseCard course={course} className="h-full" />
                  </Reveal>
                ))}
              </div>
              <Pagination meta={coursesRes?.meta} />
            </>
          ) : (
            <EmptyState
              icon={hasFilters ? SearchX : BookOpen}
              title={hasFilters ? 'No courses match your filters' : 'No courses published yet'}
              description={
                hasFilters
                  ? 'Try widening your search or clearing the filters to see everything we offer.'
                  : 'New programs are added regularly — check back soon.'
              }
              action={
                hasFilters ? (
                  <Button href="/courses" variant="secondary">
                    Clear filters
                  </Button>
                ) : (
                  <Button href="/contact">Talk to admissions</Button>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
