import { CheckCircle2, Clock, ShieldCheck, PhoneCall, FileText } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { getSiteSettings } from '@/lib/site';
import { Button, Card, SectionHeading } from '@/components/ui/primitives';
import { ApplyForm } from '@/components/site/ApplyForm';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Apply Now',
  description: 'Start your application in minutes and our admissions team will guide you through the next steps.',
};

const STEPS = [
  { title: 'Submit your application', text: 'Share your details and preferred course — it takes under two minutes.' },
  { title: 'Talk to admissions', text: 'Our team calls you to understand your goals and recommend the right batch.' },
  { title: 'Enrol & start learning', text: 'Complete enrolment, join your cohort and begin building real projects.' },
];

const PROMISES = [
  'Mentor-led small batches',
  'Placement & portfolio support',
  'Flexible online, offline & hybrid modes',
  'Verifiable certificate on completion',
];

export default async function ApplyPage({ searchParams }) {
  const params = await searchParams;
  const [coursesRes, settings] = await Promise.all([
    safeGet('/api/courses?limit=60&sort=title', { items: [] }, { revalidate: 120 }),
    getSiteSettings(),
  ]);
  const courses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.items || [];
  const contact = settings.contact || {};

  return (
    <div>
      <PageHero
        eyebrow="Admissions open"
        title="Apply to join the academy"
        description="Tell us a little about yourself — it takes less than two minutes. No payment required to apply."
        image={IMAGES.classroomAlt}
      />

      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Form */}
          <Reveal>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Application form</h2>
                  <p className="text-sm text-slate-500">Fields marked with * are required.</p>
                </div>
              </div>
              <div className="mt-6">
                <ApplyForm courses={courses} defaultCourse={params.course || ''} />
              </div>
            </Card>
          </Reveal>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={80}>
              <Card className="p-6">
                <h2 className="text-base font-bold text-slate-900">How it works</h2>
                <ol className="mt-5 space-y-5">
                  {STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </Reveal>

            <Reveal delay={140}>
              <Card className="bg-brand-50/60 p-6">
                <h2 className="text-base font-bold text-slate-900">Why students choose us</h2>
                <ul className="mt-4 space-y-2.5">
                  {PROMISES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Fast response</p>
                    <p className="text-sm text-slate-500">We reply within one working day.</p>
                  </div>
                </div>
                {(contact.phone || contact.email) && (
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-2 font-medium text-slate-700 hover:text-brand-700">
                        <PhoneCall className="h-4 w-4 text-brand-600" /> {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-2 font-medium text-slate-700 hover:text-brand-700">
                        <ShieldCheck className="h-4 w-4 text-brand-600" /> {contact.email}
                      </a>
                    )}
                  </div>
                )}
                <Button href="/contact" variant="secondary" className="mt-5 w-full">
                  Have a question?
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
