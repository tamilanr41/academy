import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Star, Briefcase, Award, CalendarClock, Mail, Globe, ArrowRight } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { SmartImage } from '@/components/site/SmartImage';
import { SocialIcon } from '@/components/site/SocialIcons';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { IMAGES } from '@/lib/media';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const trainer = await safeGet(`/api/trainers/${slug}`, null, { revalidate: 300 });
  if (!trainer) return { title: 'Trainer not found' };
  return { title: trainer.name, description: trainer.bio || `${trainer.name} — ${trainer.designation}` };
}

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

export default async function TrainerDetailPage({ params }) {
  const { slug } = await params;
  const trainer = await safeGet(`/api/trainers/${slug}`, null, { revalidate: 120 });
  if (!trainer) notFound();

  const social = trainer.social || {};
  const availability = trainer.availability || {};
  const availableDays = (availability.days || []).map((day) => DAY_LABELS[day] || day);

  return (
    <div>
      <PageHero eyebrow="Mentor profile" title={trainer.name} description={trainer.designation} image={IMAGES.workshop} />

      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* Profile card */}
          <Reveal>
            <Card className="lg:sticky lg:top-24 h-fit p-6 text-center">
              <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-xl">
                <SmartImage src={trainer.photo} alt={trainer.name} seed={trainer.name?.length || 1} />
              </div>
              <h1 className="mt-4 text-xl font-black text-slate-900">{trainer.name}</h1>
              <p className="mt-1 text-sm font-semibold text-brand-600">{trainer.designation}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {trainer.experienceYears > 0 && <Badge tone="neutral">{trainer.experienceYears}+ yrs experience</Badge>}
                {trainer.rating > 0 && (
                  <Badge tone="warning">
                    <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" /> {trainer.rating}
                  </Badge>
                )}
              </div>

              <div className="mt-5 flex justify-center gap-2">
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" aria-label="LinkedIn">
                    <SocialIcon name="linkedin" />
                  </a>
                )}
                {social.website && (
                  <a href={social.website} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" aria-label="Website">
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {trainer.email && (
                  <a href={`mailto:${trainer.email}`} className="btn btn-secondary btn-sm" aria-label="Email">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left">
                {availableDays.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Mentoring days</p>
                      <p className="text-slate-500">{availableDays.join(', ')}{availability.from ? ` · ${availability.from}–${availability.to}` : ''}</p>
                    </div>
                  </div>
                )}
                {trainer.experienceYears > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Industry experience</p>
                      <p className="text-slate-500">{trainer.experienceYears}+ years</p>
                    </div>
                  </div>
                )}
              </div>

              <Button href="/contact" className="mt-6 w-full">
                Get in touch
              </Button>
            </Card>
          </Reveal>

          {/* Content */}
          <div className="space-y-10">
            <Reveal>
              <h2 className="text-2xl font-black text-slate-900">About {trainer.name.split(' ')[0]}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{trainer.bio || 'Profile coming soon.'}</p>
            </Reveal>

            {trainer.specializations?.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-black text-slate-900">Specialisations</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trainer.specializations.map((item) => (
                    <Badge key={item} tone="brand">{item}</Badge>
                  ))}
                </div>
              </Reveal>
            )}

            {trainer.qualifications?.length > 0 && (
              <Reveal>
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                  <Award className="h-6 w-6 text-brand-600" /> Qualifications
                </h2>
                <ul className="mt-4 space-y-2">
                  {trainer.qualifications.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {trainer.courses?.length > 0 && (
              <Reveal>
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                  <GraduationCap className="h-6 w-6 text-brand-600" /> Courses taught
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {trainer.courses.map((course) => (
                    <Link key={course._id} href={`/courses/${course.slug}`} className="card card-hover flex items-center gap-4 p-4">
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <SmartImage src={course.image} alt={course.title} seed={course.title?.length || 2} sizes="64px" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-slate-900">{course.title}</span>
                        {course.fee > 0 && <span className="mt-0.5 block text-sm text-brand-600">{formatCurrency(course.fee)}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-6">
                <div>
                  <p className="font-bold text-slate-900">Want to learn from {trainer.name.split(' ')[0]}?</p>
                  <p className="text-sm text-slate-500">Browse the courses taught by this mentor.</p>
                </div>
                <Button href="/courses">
                  View courses <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
