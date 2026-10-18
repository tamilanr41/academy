import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { safeGet, SITE_URL } from '@/lib/api';
import { getSiteSettings } from '@/lib/site';
import { Button, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/site/Reveal';
import { Counter } from '@/components/site/Counter';
import { SmartImage } from '@/components/site/SmartImage';
import { Slideshow } from '@/components/site/Slideshow';
import { IMAGES, CAMPUS_MOSAIC } from '@/lib/media';

const PARTNERS = [
  'MS Office', 'Tally Prime', 'Python', 'Java', 'C++', '.NET', 'SQL',
  'React', 'TensorFlow', 'Power BI', 'Google Ads', 'WordPress', 'Excel', 'Scratch',
];

const LEVELS = [
  {
    title: 'Certificate Programs',
    text: 'Short, focused tracks that take you from fundamentals to a portfolio-worthy project in weeks — ideal if you want a fast, skill-specific upgrade alongside work or college.',
  },
  {
    title: 'Professional Programs',
    text: 'Deep, mentor-led programs with real client projects, career coaching and placement support — built for learners who want a complete career change.',
  },
];

export default async function HomePage() {
  const [settings, coursesRes, categories, testimonials] = await Promise.all([
    getSiteSettings(),
    safeGet('/api/courses?limit=8&sort=newest', [], { revalidate: 120 }),
    safeGet('/api/categories', [], { revalidate: 300 }),
    safeGet('/api/testimonials', [], { revalidate: 120 }),
  ]);

  const media = settings.media || {};
  const heroImage = media.heroImage || IMAGES.heroStudents;
  const courses = coursesRes?.length ? coursesRes : [];
  const paths = (courses.length >= 6 ? courses : [...courses, ...categories.map((c) => ({ slug: c.slug, title: c.name, category: { name: `${c.courseCount ?? 0} courses` }, durationText: '', level: '', mode: '' }))]).slice(0, 8);
  const testimonial = testimonials?.[0];

  const slides = CAMPUS_MOSAIC.slice(0, 5).map((item) => ({ src: item.src, alt: item.alt }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.academyName,
    url: SITE_URL,
    description: settings.seo?.metaDescription,
    telephone: settings.contact?.phone,
    email: settings.contact?.email,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------------------------------------------ */}
      {/* 1. Hero                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-blush-200">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow-pill">
              <Sparkles className="h-3.5 w-3.5" /> Admissions open · New cohort starting soon
            </span>
            <h1 className="mt-6 text-4xl leading-[1.3] text-balance text-brand-700 sm:text-5xl lg:text-[3.75rem]">
              {settings.tagline || 'Education that shapes your future'}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Job-oriented computer courses and Spoken English classes in Tiruppur — with certificates,
              affordable fees and practical training.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/courses">
                Explore Courses <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/apply" variant="secondary">
                Apply now
              </Button>
            </div>
          </div>

          <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden lg:max-w-lg">
            <SmartImage src={heroImage} alt="Learners at the academy" sizes="40vw" priority className="animate-kenburns" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Skills & tools you will master                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-accent-400 py-14 sm:py-16">
        <div className="container-page">
          <Reveal>
            <h2 className="text-center text-2xl sm:text-[2rem]">Skills &amp; Tools You Will Master</h2>
          </Reveal>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {PARTNERS.map((name) => (
              <span key={name} className="text-base font-semibold tracking-wide text-brand-700/70 transition hover:text-brand-700 sm:text-lg">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Study at your level                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Programs"
              title="Study at your level"
              description="Whether you are starting out or levelling up, there is a path built for where you are today."
            />
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
            {LEVELS.map((level, index) => (
              <Reveal key={level.title} delay={index * 100}>
                <div>
                  <h3 className="text-[1.6rem]">{level.title}</h3>
                  <div className="rule mt-4" />
                  <p className="mt-4 text-base leading-relaxed text-slate-600">{level.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/courses" variant="secondary">
              Explore Degree Options <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Slideshow                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Campus life" className="bg-white pb-4">
        <Slideshow slides={slides} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Find your study path                                             */}
      {/* ------------------------------------------------------------------ */}
      {paths.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="container-page">
            <Reveal>
              <SectionHeading
                eyebrow="Courses"
                title="Find your study path"
                description="Browse our course catalogue — job-oriented, practical and affordable, with certificates on completion."
              />
            </Reveal>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {paths.map((path, index) => (
                <Reveal key={path.slug} delay={(index % 2) * 80}>
                  <Link href={`/courses/${path.slug}`} className="group block border-b border-brand-600/10 pb-6">
                    <h3 className="text-xl text-ink-900 transition group-hover:text-brand-700">
                      <span className="underline-offset-4 group-hover:underline">{path.title}</span>
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {[path.durationText, path.level && path.level[0]?.toUpperCase() + path.level.slice(1), path.category?.name]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button href="/courses" variant="secondary">
                Explore all courses <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. Learning, living, and growing                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Outcomes"
              title="Learning, living, and growing"
              description="More than classes — a community that measures success by what you go on to do."
            />
          </Reveal>

          <div className="mt-12 space-y-14">
            <Reveal className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage src={IMAGES.classroom} alt="Students learning together" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div>
                <p className="text-4xl leading-tight text-brand-700 sm:text-[2.25rem]">
                  <Counter value={19} suffix="+" /> courses across software and communication skills
                </p>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  From MS Office and Tally to Python, AI, web development and spoken English — taught
                  practically, with certificates on completion and affordable, transparent fees.
                </p>
              </div>
            </Reveal>

            <Reveal className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className="lg:order-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage src={IMAGES.lab} alt="Practical project work" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </div>
              <div className="lg:order-1">
                <p className="text-4xl leading-tight text-brand-700 sm:text-[2.25rem]">
                  <Counter value={3} /> levels of spoken English, basic to advanced
                </p>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  Fluency, grammar, vocabulary, interview and daily speaking practice — for students, job
                  seekers and working professionals who want to speak with confidence.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Voices from the crowd                                            */}
      {/* ------------------------------------------------------------------ */}
      {testimonial && (
        <section className="bg-blush-200 py-16 sm:py-20">
          <div className="container-page">
            <Reveal>
              <h2 className="text-center text-2xl sm:text-[2rem]">Voices from the Crowd</h2>
            </Reveal>
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <Reveal className="relative aspect-[4/5] overflow-hidden">
                <SmartImage
                  src={testimonial.photo || IMAGES.heroStudents}
                  alt={testimonial.name}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-full w-full object-cover"
                />
              </Reveal>
              <Reveal delay={120}>
                <blockquote className="text-xl leading-relaxed text-slate-700 sm:text-2xl sm:leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <figcaption className="mt-7">
                  <p className="text-lg text-ink-900">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{testimonial.role || testimonial.course?.title}</p>
                </figcaption>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 8. Admissions CTA                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-blush-100 py-16 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <Reveal>
            <h2 className="text-3xl leading-[1.25] text-brand-700 sm:text-4xl lg:text-[3.5rem]">
              Our admissions team is here to guide you
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Tell us where you want to go and we will help you choose the right course, batch and payment plan — no
              pressure, no jargon.
            </p>
            <div className="mt-8">
              <Button href="/apply">
                Apply now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative aspect-[4/3] overflow-hidden">
            <SmartImage src={IMAGES.teamwork} alt="Admissions guidance" sizes="(max-width: 1024px) 100vw, 45vw" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
