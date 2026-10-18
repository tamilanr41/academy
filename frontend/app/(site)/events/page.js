import { CalendarDays, MapPin, Clock, ArrowRight, CalendarX2, Users } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { SectionHeading, EmptyState, Badge, Button } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SmartImage } from '@/components/site/SmartImage';
import { IMAGES } from '@/lib/media';
import { humanize } from '@/lib/format';

export const metadata = {
  title: 'Events',
  description: 'Workshops, seminars and open days at the academy.',
};

function EventGridCard({ event }) {
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;
  const dateStr = start
    ? start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date to be announced';
  const timeStr = start ? start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <article className="group card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video">
        <SmartImage src={event.image} alt={event.title} seed={event.title?.length || 2} sizes="(max-width: 1024px) 100vw, 33vw" className="transition duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
        {start && (
          <span className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white/95 shadow-lg backdrop-blur">
            <span className="text-lg font-black leading-none text-slate-900">{start.getDate()}</span>
            <span className="text-[11px] font-bold uppercase text-brand-600">{start.toLocaleString('en-IN', { month: 'short' })}</span>
          </span>
        )}
        <span className="absolute right-4 top-4 flex gap-2">
          <Badge tone="neutral" className="bg-white/90 text-slate-700 ring-white/40">{humanize(event.category || 'other')}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-brand-700">{event.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{event.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-brand-600" /> {dateStr}</span>
          {timeStr && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand-600" /> {timeStr}{end ? ' onwards' : ''}</span>}
          {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-600" /> {event.location}</span>}
          {event.seats > 0 && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand-600" /> {event.seats} seats</span>}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <Badge tone="info">{humanize(event.mode || 'offline')}</Badge>
          {event.registrationUrl ? (
            <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700">
              Register <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400">
              Details soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const events = await safeGet('/api/events', [], { revalidate: 120 });

  const now = Date.now();
  const upcoming = events
    .filter((event) => event.startDate && new Date(event.startDate).getTime() >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const past = events
    .filter((event) => !event.startDate || new Date(event.startDate).getTime() < now)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const ordered = [...upcoming, ...past];

  return (
    <div>
      <PageHero
        eyebrow="What's on"
        title="Events, workshops & open days"
        description="Experience the academy first-hand — meet our mentors, tour the campus and get your questions answered."
        image={IMAGES.event}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/apply">
            Apply now <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/contact" variant="secondary">
            Book a campus visit
          </Button>
        </div>
      </PageHero>

      <div className="container-page py-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow={upcoming.length ? 'Upcoming' : 'What’s on'}
            title={upcoming.length ? 'Upcoming events' : 'All events'}
            description={upcoming.length ? 'Reserve your spot — seats are limited.' : 'Check back soon, new events are added regularly.'}
          />
        </Reveal>

        <div className="mt-10">
          {ordered.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordered.map((event, index) => (
                <Reveal key={event._id} delay={(index % 3) * 80} className="h-full">
                  <EventGridCard event={event} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarX2} title="No upcoming events" description="Keep an eye on this page — we add new workshops and open days regularly." action={<Button href="/contact">Get notified</Button>} />
          )}
        </div>
      </div>
    </div>
  );
}
