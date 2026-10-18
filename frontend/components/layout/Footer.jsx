import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle, Heart } from 'lucide-react';
import { FOOTER_LINKS } from '@/lib/constants';
import { formatAddress } from '@/lib/site';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';
import { SocialIcon } from '@/components/site/SocialIcons';

const SOCIALS = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((key) => ({ key }));

export function Footer({ settings }) {
  const year = new Date().getFullYear();
  const contact = settings?.contact || {};
  const social = settings?.social || {};
  const socials = SOCIALS.filter((item) => social[item.key]);
  const whatsapp = contact.whatsapp || social.whatsapp || '';

  return (
    <footer className="mt-24 bg-brand-600 text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo settings={settings} textClassName="text-white" markClassName="bg-blush-300 text-brand-700" />
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80">{settings?.footer?.aboutText || settings?.footer?.about || settings?.tagline}</p>
          <div className="mt-6 space-y-3 text-base text-white/80">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 transition hover:text-white">
                <Phone className="h-4 w-4" /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 transition hover:text-white">
                <Mail className="h-4 w-4" /> {contact.email}
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition hover:text-white">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            )}
            {contact.address && (
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {formatAddress(contact.address)}
              </p>
            )}
          </div>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ key }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/85 transition hover:border-blush-300 hover:bg-blush-300 hover:text-brand-700"
                  aria-label={key}
                >
                  <SocialIcon name={key} className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="text-xl font-normal text-white">{heading}</h3>
            <ul className="mt-5 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-white/85 underline-offset-4 transition hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/20">
        <div className="container-page flex flex-col items-start justify-between gap-5 py-7 md:flex-row md:items-center">
          <p className="text-sm text-white/75">
            © {year} {settings?.academyName || 'Academy'}. All rights reserved. <span className="inline-flex items-center gap-1">Built with <Heart className="inline h-3.5 w-3.5 text-blush-300" /> for learners.</span>
          </p>
          <div className="w-full max-w-sm">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </footer>
  );
}
