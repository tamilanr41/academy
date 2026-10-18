import Link from 'next/link';
import { Clock, Users, Star, BadgeCheck, ArrowRight, MapPin, Timer } from 'lucide-react';
import { SmartImage } from './SmartImage';
import { TRACK_IMAGES, IMAGES } from '@/lib/media';
import { formatCurrency, humanize } from '@/lib/format';

export function CourseCard({ course, className }) {
  const hasDiscount = course.discountFee > 0 && course.discountFee < course.fee;
  const price = hasDiscount ? course.discountFee : course.fee;
  const seatsLeft = Math.max(0, (course.seats || 0) - (course.enrolledCount || 0));

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`group card card-hover flex flex-col overflow-hidden ${className || ''}`}
    >
      <div className="relative aspect-video overflow-hidden border-b border-ink-900/15">
        <SmartImage src={course.image} alt={course.title} seed={course.slug?.length || 1} sizes="(max-width: 768px) 100vw, 33vw" className="transition duration-700 group-hover:scale-110" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-ink-900/5 to-transparent" />
        {course.isFeatured && (
          <span className="sticker sticker-accent sticker-tilt absolute left-3 top-3">Featured</span>
        )}
        {hasDiscount && (
          <span className="sticker absolute right-3 top-3 bg-red-600 text-white">
            {Math.round(100 - (course.discountFee / course.fee) * 100)}% off
          </span>
        )}
        {course.category?.name && (
          <span className="sticker absolute bottom-3 left-3">{course.category.name}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-500">
          <span>{humanize(course.level || 'beginner')}</span>
          <span className="text-slate-300">/</span>
          <span>{humanize(course.mode || 'online')}</span>
        </div>

        <h3 className="mt-2.5 text-xl leading-tight text-slate-900 transition group-hover:text-brand-700">
          {course.title}
        </h3>
        {course.shortDescription && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{course.shortDescription}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
          {course.durationText && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {course.durationText}
            </span>
          )}
          {seatsLeft > 0 ? (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {seatsLeft} seats left
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-brand-500">Filling fast</span>
          )}
          {course.certificateProvided && (
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5" /> Certificate
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-brand-600/10 pt-4">
          <div>
            {price > 0 ? (
              <>
                <p className="display text-2xl text-slate-900">{formatCurrency(price)}</p>
                {hasDiscount && <p className="mt-1 text-xs font-medium text-slate-400 line-through">{formatCurrency(course.fee)}</p>}
              </>
            ) : (
              <p className="text-sm font-semibold text-slate-600">Fee on request</p>
            )}
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700 transition group-hover:text-brand-700">
            View
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition group-hover:bg-brand-700">
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video animate-pulse border-b border-ink-900/15 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse bg-brand-100" />
        <div className="h-6 w-3/4 animate-pulse bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse bg-slate-100" />
        <div className="flex items-end justify-between pt-4">
          <div className="h-7 w-28 animate-pulse bg-slate-200" />
          <div className="h-8 w-24 animate-pulse bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCard({ category, index = 0 }) {
  const image = TRACK_IMAGES[category.slug] || IMAGES.classroom;
  return (
    <Link
      href={`/courses?category=${category.slug}`}
      className="group card card-hover relative flex h-56 flex-col justify-end overflow-hidden"
    >
      <SmartImage src={image} alt={category.name} seed={index} sizes="(max-width: 768px) 100vw, 33vw" className="transition duration-700 group-hover:scale-110" />
      <span className="absolute inset-0 bg-gradient-to-t from-ink-900/92 via-ink-900/45 to-transparent" />
      <span className="absolute left-0 top-0 rounded-br-lg bg-brand-600 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="relative p-5">
        <div className="rule mb-3 w-12 bg-white/40" />
        <h3 className="text-xl text-white">{category.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-white/70">
            {category.courseCount ?? 0} courses
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:bg-blush-300 group-hover:text-brand-700">
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TrainerCard({ trainer }) {
  return (
    <Link href={`/trainers/${trainer.slug}`} className="group card card-hover overflow-hidden">
      <div className="p-5">
        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-brand-600/20 bg-blush-200">
          <SmartImage src={trainer.photo} alt={trainer.name} seed={trainer.name?.length || 2} sizes="128px" />
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-lg text-slate-900 transition group-hover:text-brand-700">{trainer.name}</h3>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-500">{trainer.designation}</p>
        </div>

        {trainer.bio && <p className="mt-3 line-clamp-3 text-center text-sm leading-relaxed text-slate-600">{trainer.bio}</p>}

        <div className="mt-4 flex items-center justify-center gap-3 border-t border-brand-600/10 pt-3 text-xs font-medium text-slate-500">
          {trainer.experienceYears > 0 && <span>{trainer.experienceYears}+ yrs experience</span>}
          {trainer.experienceYears > 0 && trainer.rating > 0 && <span className="text-slate-300">/</span>}
          {trainer.rating > 0 && (
            <span className="flex items-center gap-1 text-slate-700">
              <Star className="h-3.5 w-3.5 fill-accent-600 text-accent-600" /> {trainer.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function TestimonialCard({ testimonial }) {
  const photo = testimonial.photo;
  return (
    <figure className="card card-hover relative flex h-full flex-col p-6">
      <span className="display pointer-events-none absolute right-5 top-1 select-none text-7xl leading-none text-brand-100" aria-hidden>
        &ldquo;
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={index < (testimonial.rating || 5) ? 'h-4 w-4 fill-accent-600 text-accent-600' : 'h-4 w-4 text-slate-300'}
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">&ldquo;{testimonial.content}&rdquo;</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-brand-600/10 pt-4">
        <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full border border-brand-600/20">
          <SmartImage src={photo} alt={testimonial.name} seed={testimonial.name?.length || 3} sizes="44px" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">{testimonial.name}</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-500">{testimonial.role || testimonial.course?.title}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function EventCard({ event }) {
  const start = event.startDate ? new Date(event.startDate) : null;
  const day = start ? start.toLocaleDateString('en-IN', { day: '2-digit' }) : '—';
  const month = start ? start.toLocaleDateString('en-IN', { month: 'short' }) : 'TBA';

  return (
    <article className="card card-hover flex flex-col gap-4 overflow-hidden p-4 sm:flex-row">
      <div className="flex w-full shrink-0 flex-row items-center gap-3 rounded-lg border border-brand-600/15 bg-accent-400 py-3 text-ink-900 sm:w-16 sm:flex-col">
        <span className="display ml-3 text-2xl sm:ml-0">{day}</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] sm:mt-1">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base text-slate-900 sm:truncate">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{event.description}</p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </span>
          )}
          {start && (
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />{' '}
              {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
