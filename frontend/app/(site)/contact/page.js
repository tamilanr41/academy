import { Mail, Phone, MapPin, Clock, MessageCircle, Navigation } from 'lucide-react';
import { getSiteSettings, formatAddress } from '@/lib/site';
import { Card, SectionHeading, Button } from '@/components/ui/primitives';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SocialIcon } from '@/components/site/SocialIcons';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with our admissions team for course and admission enquiries.',
};

const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const contact = settings.contact || {};
  const social = settings.social || {};
  const socialEntries = Object.entries(social).filter(([, url]) => url);
  const whatsapp = contact.whatsapp || social.whatsapp || '';

  const items = [
    contact.phone && { icon: Phone, label: 'Call us', value: contact.phone, href: `tel:${contact.phone}` },
    contact.email && { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    whatsapp && { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: whatsapp },
    contact.address && { icon: MapPin, label: 'Visit us', value: formatAddress(contact.address) },
  ].filter(Boolean);

  const hours = contact.businessHours?.length
    ? contact.businessHours
    : [
        { day: 'mon', open: '09:00', close: '19:00' },
        { day: 'tue', open: '09:00', close: '19:00' },
        { day: 'wed', open: '09:00', close: '19:00' },
        { day: 'thu', open: '09:00', close: '19:00' },
        { day: 'fri', open: '09:00', close: '19:00' },
        { day: 'sat', open: '10:00', close: '16:00' },
        { day: 'sun', closed: true },
      ];

  const directionsHref =
    contact.coordinates?.lat && contact.coordinates?.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${contact.coordinates.lat},${contact.coordinates.lng}`
      : contact.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(contact.address))}`
        : 'https://maps.google.com';

  return (
    <div>
      <PageHero
        eyebrow="Get in touch"
        title="We'd love to hear from you"
        description="Questions about a course, a batch or admissions? Our team replies within one working day."
        image={IMAGES.meeting}
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <div className="space-y-6">
            <Reveal>
              <SectionHeading align="left" eyebrow="Contact details" title="Reach us directly" />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {items.map((item, index) => (
                <Reveal key={item.label} delay={index * 70}>
                  <Card className="card-hover flex items-start gap-4 p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noreferrer" className="mt-0.5 block font-semibold text-slate-800 hover:text-brand-700">
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-semibold text-slate-800">{item.value}</p>
                      )}
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-600" />
                  <h3 className="font-bold text-slate-900">Office hours</h3>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  {hours.map((row) => (
                    <div key={row.day} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <dt className="text-slate-500">{DAY_LABELS[row.day] || row.day}</dt>
                      <dd className="font-semibold text-slate-800">{row.closed ? 'Closed' : `${row.open} – ${row.close}`}</dd>
                    </div>
                  ))}
                </dl>
                {socialEntries.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                    {socialEntries.map(([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={name}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-brand-600 hover:text-white"
                      >
                        <SocialIcon name={name} />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={100}>
            <Card className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">Send us a message</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the form and we&apos;ll be in touch shortly.</p>
              <div className="mt-6">
                <EnquiryForm />
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Location / map */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow="Find us" title="Visit the campus" description="We'd love to show you around — drop by during office hours or book a tour." />
          </Reveal>
          <Reveal delay={100} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              {contact.mapEmbedUrl ? (
                <iframe
                  title="Academy location"
                  src={contact.mapEmbedUrl}
                  className="h-[360px] w-full sm:h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="relative h-[360px] w-full sm:h-[420px]">
                  <iframe
                    title="Academy location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(formatAddress(contact.address) || 'Tiruppur')}&output=embed`}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>

            <Card className="flex flex-col justify-between p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{settings.academyName}</h3>
                {contact.address && <p className="mt-3 text-sm leading-relaxed text-slate-600">{formatAddress(contact.address)}</p>}
                {contact.phone && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="h-4 w-4 text-brand-600" /> {contact.phone}
                  </p>
                )}
                {contact.email && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="h-4 w-4 text-brand-600" /> {contact.email}
                  </p>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <Button href={directionsHref} className="w-full" target="_blank" rel="noreferrer">
                  <Navigation className="h-4 w-4" /> Get directions
                </Button>
                <Button href="/apply" variant="secondary" className="w-full">
                  Start your application
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
