import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Users,
  BadgeCheck,
  Star,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  IndianRupee,
  PlayCircle,
  Share2,
  CalendarClock,
  BookOpenCheck,
  Sparkles,
} from 'lucide-react';
import { safeGet, SITE_URL } from '@/lib/api';
import { formatCurrency, humanize } from '@/lib/format';
import { Badge, Button, Card, SectionHeading } from '@/components/ui/primitives';
import { SmartImage } from '@/components/site/SmartImage';
import { CourseCard } from '@/components/site/Cards';
import { ReviewForm } from '@/components/site/ReviewForm';
import { Reveal } from '@/components/site/Reveal';
import { VideoModal } from '@/components/site/VideoModal';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await safeGet(`/api/courses/${slug}`, null, { revalidate: 120 });
  const course = data?.course;
  if (!course) return { title: 'Course not found' };
  return {
    title: course.seo?.metaTitle || course.title,
    description: course.seo?.metaDescription || course.shortDescription || undefined,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      images: course.image?.url ? [course.image.url] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const data = await safeGet(`/api/courses/${slug}`, null, { revalidate: 60 });
  if (!data?.course) notFound();

  const course = data.course;
  const related = data.related || [];
  const reviews = (course.reviews || []).filter((review) => review.isApproved);
  const hasDiscount = course.discountFee > 0 && course.discountFee < course.fee;
  const price = hasDiscount ? course.discountFee : course.fee;
  const priceOnRequest = !(price > 0);
  const seatsLeft = Math.max(0, (course.seats || 0) - (course.enrolledCount || 0));
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;
  const heroImage = course.banner?.url || course.image?.url || null;
  const hasTrailer = Boolean(course.videoUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.description,
    provider: { '@type': 'Organization', name: 'Academy', sameAs: SITE_URL },
    offers: { '@type': 'Offer', price, priceCurrency: course.currency || 'INR', category: 'Paid' },
    ...(avgRating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews.length } } : {}),
  };

  const facts = [
    { icon: Layers, label: 'Level', value: humanize(course.level) },
    { icon: Clock, label: 'Duration', value: course.durationText || '—' },
    { icon: Users, label: 'Seats', value: seatsLeft > 0 ? `${seatsLeft} available` : 'Waitlist' },
    { icon: BadgeCheck, label: 'Certificate', value: course.certificateProvided ? 'Included' : 'Not included' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-blush-200">
        <div className="container-page relative py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/courses" className="hover:text-ink-900">Courses</Link>
            {course.category?.name && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/courses?category=${course.category.slug}`} className="hover:text-ink-900">{course.category.name}</Link>
              </>
            )}
          </nav>

          <div className="grid gap-10 py-8 lg:grid-cols-[1.5fr_1fr] lg:py-12">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                {course.category?.name && (
                  <Link href={`/courses?category=${course.category.slug}`}>
                    <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                      {course.category.name}
                    </span>
                  </Link>
                )}
                <Badge tone="neutral">{humanize(course.level)}</Badge>
                <Badge tone="neutral">{humanize(course.mode)}</Badge>
                {course.certificateProvided && (
                  <Badge tone="success">Certificate</Badge>
                )}
              </div>

              <h1 className="mt-5 text-3xl leading-tight text-balance text-ink-900 sm:text-4xl lg:text-5xl">{course.title}</h1>
              {course.shortDescription && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{course.shortDescription}</p>}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                {avgRating && (
                  <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                    <Star className="h-4 w-4 fill-accent-600 text-accent-600" /> {avgRating}
                    <span className="font-normal text-slate-500">({reviews.length} reviews)</span>
                  </span>
                )}
                {course.durationText && (
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-500" /> {course.durationText}</span>
                )}
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-500" /> {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Filling fast'}</span>
                {course.trainers?.length > 0 && (
                  <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-brand-500" /> {course.trainers.map((t) => t.name).join(', ')}</span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={`/apply?course=${course._id}`}>
                  Apply for this course
                </Button>
                <Button href="/contact" variant="secondary">
                  Ask a question
                </Button>
                {hasTrailer && (
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <PlayCircle className="h-5 w-5 text-brand-500" /> Watch the trailer
                  </span>
                )}
              </div>
            </div>

            {/* Media */}
            <div className="relative animate-scale-in">
              {hasTrailer ? (
                <VideoModal url={course.videoUrl} poster={heroImage} title={`${course.title} trailer`} className="overflow-hidden rounded-2xl border border-brand-600/10 shadow-xl">
                  <span className="block text-xs font-medium uppercase tracking-[0.2em] text-white/85">Course trailer</span>
                  <span className="mt-1 block text-xl font-semibold text-white">See what you&apos;ll build</span>
                </VideoModal>
              ) : (
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-brand-600/10 shadow-xl lg:aspect-[4/3]">
                  <SmartImage src={heroImage} alt={course.title} seed={course.slug?.length || 5} priority sizes="(max-width: 1024px) 100vw, 40vw" className="animate-kenburns" />
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-600/15 bg-white px-5 py-4">
                <div>
                  <p className="display text-2xl text-slate-900">{priceOnRequest ? 'Fee on request' : formatCurrency(price)}</p>
                  {hasDiscount && (
                    <p className="text-xs text-slate-500">
                      <span className="line-through">{formatCurrency(course.fee)}</span> · save {formatCurrency(course.fee - course.discountFee)}
                    </p>
                  )}
                </div>
                <Button href={`/apply?course=${course._id}`} size="sm">
                  Enrol now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-6 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <fact.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{fact.label}</p>
                <p className="font-semibold text-slate-800">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-12">
          {course.description && (
            <Reveal>
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <BookOpenCheck className="h-6 w-6 text-brand-600" /> About this course
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">{course.description}</p>
            </Reveal>
          )}

          {course.learningOutcomes?.length > 0 && (
            <Reveal>
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <Sparkles className="h-6 w-6 text-brand-600" /> What you&apos;ll learn
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {course.learningOutcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {course.curriculum?.length > 0 && (
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                  <Layers className="h-6 w-6 text-brand-600" /> Course curriculum
                </h2>
                <span className="text-sm font-medium text-slate-500">{course.curriculum.length} modules</span>
              </div>
              <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {course.curriculum.map((module, index) => (
                  <details key={module._id || module.title} className="group" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-black text-brand-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-semibold text-slate-800">{module.title}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 pl-[4.25rem] text-sm text-slate-600">
                      {module.description && <p className="leading-relaxed">{module.description}</p>}
                      {module.duration && <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Duration: {module.duration}</p>}
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          )}

          {course.trainers?.length > 0 && (
            <Reveal>
              <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <GraduationCap className="h-6 w-6 text-brand-600" /> Your trainers
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {course.trainers.map((trainer) => (
                  <Link
                    key={trainer._id}
                    href={trainer.slug ? `/trainers/${trainer.slug}` : '/trainers'}
                    className="card card-hover flex items-center gap-4 p-4"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
                      <SmartImage src={trainer.photo} alt={trainer.name} seed={trainer.name?.length || 1} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{trainer.name}</p>
                      <p className="text-sm text-brand-600">{trainer.designation}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {course.prerequisites?.length > 0 && (
            <Reveal>
              <h2 className="text-2xl font-black text-slate-900">Prerequisites</h2>
              <ul className="mt-4 space-y-2">
                {course.prerequisites.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {course.faqs?.length > 0 && (
            <Reveal>
              <h2 className="text-2xl font-black text-slate-900">FAQs</h2>
              <div className="mt-5 space-y-2">
                {course.faqs.map((faq) => (
                  <details key={faq._id || faq.question} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-brand-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-black text-slate-900">Student reviews</h2>
              {avgRating && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {avgRating} / 5 · {reviews.length} reviews
                </span>
              )}
            </div>
            {reviews.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {reviews.map((review) => (
                  <Card key={review._id} className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{review.name}</p>
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={index < review.rating ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-slate-300'} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No reviews yet — be the first to share your experience.</p>
            )}
            <div className="mt-6">
              <ReviewForm courseId={course._id} />
            </div>
          </Reveal>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="flex items-end gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <p className="text-3xl font-black text-slate-900">{priceOnRequest ? 'Fee on request' : formatCurrency(price)}</p>
              {hasDiscount && <p className="pb-1 text-sm text-slate-400 line-through">{formatCurrency(course.fee)}</p>}
              {hasDiscount && (
                <span className="mb-1 ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  Save {formatCurrency(course.fee - course.discountFee)}
                </span>
              )}
            </div>

            <div className="p-6">
              <dl className="space-y-3.5 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-slate-500">
                      <fact.icon className="h-4 w-4" /> {fact.label}
                    </dt>
                    <dd className="font-semibold text-slate-800">{fact.value}</dd>
                  </div>
                ))}
                {course.startDate && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-slate-500">
                      <CalendarClock className="h-4 w-4" /> Next batch
                    </dt>
                    <dd className="font-semibold text-slate-800">See schedule</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 space-y-3">
                <Button href={`/apply?course=${course._id}`} className="w-full">
                  Apply for this course
                </Button>
                <Button href="/contact" variant="secondary" className="w-full">
                  Ask a question
                </Button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <IndianRupee className="h-3.5 w-3.5" /> EMI &amp; instalment options available
              </p>
            </div>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Share2 className="h-3.5 w-3.5" /> Share this course with a friend
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-slate-900">{priceOnRequest ? 'Fee on request' : formatCurrency(price)}</p>
            <p className="text-xs text-slate-500">{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Filling fast'}</p>
          </div>
          <Button href={`/apply?course=${course._id}`} className="flex-1">
            Enrol now
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="container-page">
            <Reveal>
              <SectionHeading align="left" eyebrow="Keep exploring" title="Related courses" description="Similar programs learners often compare." />
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal key={item._id} delay={(index % 4) * 80}>
                  <CourseCard course={item} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
