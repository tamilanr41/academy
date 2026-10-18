import Link from 'next/link';
import {
  Target,
  HeartHandshake,
  Rocket,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { safeGet } from '@/lib/api';
import { getSiteSettings } from '@/lib/site';
import { Button, Card, SectionHeading } from '@/components/ui/primitives';
import { SmartImage } from '@/components/site/SmartImage';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { Counter } from '@/components/site/Counter';
import { VideoModal } from '@/components/site/VideoModal';
import { TrainerCard } from '@/components/site/Cards';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'About Us',
  description: 'Our mission, values, journey and the team behind the academy.',
};

const VALUES = [
  { icon: Target, title: 'Outcome obsessed', text: 'We measure success by where our students land, not how many certificates we print.' },
  { icon: HeartHandshake, title: 'Mentorship first', text: 'Small batches and personal mentors mean no one gets left behind.' },
  { icon: Rocket, title: 'Always current', text: 'Curriculum is refreshed continuously to match what the industry actually hires for.' },
  { icon: Award, title: 'Quality you can verify', text: 'Transparent reviews, real projects and certificates employers trust.' },
];

const MILESTONES = [
  { year: '2016', title: 'The first classroom', text: 'We started with one weekend batch of twelve learners and a simple promise: teach skills that get people hired.' },
  { year: '2018', title: '1000 graduates', text: 'Our alumni network crossed a thousand working professionals across the country.' },
  { year: '2021', title: 'Hybrid by design', text: 'We rebuilt every program for online, offline and hybrid delivery without losing the mentor-led experience.' },
  { year: '2024', title: 'Hiring partner network', text: 'Over 150 companies now recruit directly from our graduating cohorts.' },
];

const DIFFERENTIATORS = [
  'Live mentor-led classes — never pre-recorded lectures',
  'Portfolio-first learning with real client-style projects',
  'Dedicated placement cell with mock interviews and referrals',
  'Flexible weekend, weekday and fast-track batch options',
];

export default async function AboutPage() {
  const [settings, courses, trainers] = await Promise.all([
    getSiteSettings(),
    safeGet('/api/courses?limit=1', { meta: null }, { revalidate: 300 }),
    safeGet('/api/trainers', [], { revalidate: 300 }),
  ]);

  const media = settings.media || {};
  const courseCount = courses?.meta?.total || 0;

  const stats = [
    { icon: Briefcase, value: courseCount || 19, suffix: '+', label: 'Job-oriented courses' },
    { icon: Users, value: Math.max(trainers.length, 4), suffix: '+', label: 'Expert mentors' },
    { icon: GraduationCap, value: 3, suffix: '', label: 'Spoken English levels' },
    { icon: Award, value: 14, suffix: '', label: 'Software courses' },
  ];

  const campusVideo = media.campusVideoUrl || media.promoVideoUrl || '';
  const campusPoster = media.campusPoster || IMAGES.presentation;

  return (
    <div>
      <PageHero
        eyebrow="About the academy"
        title="Building careers, not just classrooms"
        description={
          settings.footer?.aboutText ||
          settings.footer?.about ||
          'We are a modern learning academy focused on practical, mentor-led education that prepares students for real roles in industry.'
        }
        image={IMAGES.campus}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/courses">
            Browse courses <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/contact" variant="secondary">
            Talk to us
          </Button>
        </div>
      </PageHero>

      {/* Story + collage */}
      <section className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <SmartImage src={IMAGES.classroom} alt="A mentor-led classroom session" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-52 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block">
            <div className="relative aspect-[4/3]">
              <SmartImage src={IMAGES.mentorReview} alt="One-on-one mentor review" seed={3} sizes="240px" />
            </div>
          </div>
          <div className="absolute -left-4 top-6 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black leading-none text-slate-900">4.9 / 5</p>
              <p className="text-xs text-slate-500">average student rating</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="eyebrow-pill">Who we are</span>
          <h2 className="section-title mt-3 text-balance">Practical education, designed around outcomes</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            From the first enquiry to placement support, everything we do is designed around one goal: helping you build skills
            and confidence that translate directly into opportunities.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Our mentors are practitioners first — people who ship real work every day and teach from experience, not textbooks.
            That is why our learners finish with portfolios employers actually want to see.
          </p>
          <ul className="mt-6 space-y-3">
            {DIFFERENTIATORS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button href="/courses">
              Explore the catalogue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Stats band */}
      <section className="relative overflow-hidden bg-blush-200 py-16">
        <div className="container-page relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600">
                <stat.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-4xl text-brand-700 sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Our values" title="What we stand for" description="Four principles guide every decision we make — from curriculum design to how we treat our learners." />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={(index % 4) * 80}>
                <Card className="card-hover h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="container-page py-16 sm:py-20">
        <Reveal>
          <SectionHeading align="left" eyebrow="Our journey" title="A decade of learning, in milestones" />
        </Reveal>
        <ol className="relative mt-12 space-y-10 border-l border-slate-200 pl-8 sm:pl-10">
          {MILESTONES.map((milestone, index) => (
            <Reveal key={milestone.year} delay={index * 80} className="relative">
              <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-brand-600 shadow sm:-left-[49px]" />
              <p className="text-sm font-black uppercase tracking-wide text-brand-600">{milestone.year}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{milestone.title}</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{milestone.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Campus video */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <VideoModal url={campusVideo} poster={campusPoster} title="Take a campus tour" className="shadow-2xl">
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-accent-400">Campus tour</span>
              <span className="mt-1 block text-2xl font-black text-white">Step inside the academy</span>
            </VideoModal>
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow-pill">Our mission</span>
            <h2 className="section-title mt-3 text-balance">Make great careers accessible to everyone</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              We believe talent is everywhere but opportunity is not. Our mission is to close that gap with affordable,
              high-quality, mentor-led education — available online, offline or a blend of both.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Whether you are a student, a working professional pivoting careers, or someone returning to work, there is a
              track and a batch built for your schedule.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/apply">
                Apply now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/events" variant="secondary">
                Attend an open day
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      {trainers.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading align="left" eyebrow="The people" title="Meet a few of our mentors" description="Practitioners who teach what they do." />
            <Button href="/trainers" variant="secondary" size="sm">
              All trainers <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trainers.slice(0, 4).map((trainer, index) => (
              <Reveal key={trainer._id} delay={(index % 4) * 80}>
                <TrainerCard trainer={trainer} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-600/10 bg-blush-100 px-8 py-14 text-center sm:px-16 sm:py-20">
            <div className="relative">
              <span className="eyebrow-pill">Start today</span>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl text-brand-700 sm:text-4xl lg:text-5xl">
                Come learn with us
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                Explore our catalogue or talk to our team about the right path for you.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/courses">
                  View courses <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/apply" variant="secondary">
                  Apply now
                </Button>
              </div>
              <p className="mt-8 text-sm text-slate-500">
                Have questions?{' '}
                <Link href="/faq" className="font-semibold text-brand-600 underline underline-offset-4 hover:text-brand-700">
                  Read our FAQs
                </Link>{' '}
                or{' '}
                <Link href="/contact" className="font-semibold text-brand-600 underline underline-offset-4 hover:text-brand-700">
                  get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
