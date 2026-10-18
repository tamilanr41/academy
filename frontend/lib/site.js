import { apiFetch } from './api';

/** Fallback branding used when the backend/settings are unavailable. */
export const DEFAULT_SETTINGS = {
  academyName: 'Magma Minds Academy',
  tagline: 'No. 1 Computer Training and Spoken English Classes in Tiruppur',
  logo: { url: '/logo.png', publicId: '' },
  favicon: { url: '', publicId: '' },
  contact: {
    phone: '+91 96555 33886',
    email: 'magmaminds@gmail.com',
    whatsapp: '',
    address: { line1: 'Magma Minds Academy', line2: '', city: 'Tiruppur', state: 'Tamil Nadu', pincode: '641604', country: 'India' },
  },
  social: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
  brand: { primaryColor: '#971F05', accentColor: '#F4B9B9' },
  locale: { currency: 'INR', timezone: 'Asia/Kolkata' },
  seo: { metaTitle: 'Magma Minds Academy — Computer Training & Spoken English in Tiruppur', metaDescription: 'No. 1 computer training and spoken English classes in Tiruppur. Job-oriented courses with certificates, affordable fees and practical training.' },
  features: { maintenanceMode: false, enablePayments: false, enableReviews: true },
  footer: {
    aboutText: 'Magma Minds Academy is Tiruppur’s institute for job-oriented software training and spoken English. Choose from MS Office, Tally, C++, Java, Python, .NET, AI, ML, DL, Web Development, Data Science, Digital Marketing, SQL and Data Analytics — plus communication skills and kids courses. Job oriented · Certificates · Affordable fees · Practical training.',
    copyright: '',
  },
  media: {
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80',
    heroVideoUrl: '',
    promoVideoUrl: '',
    promoPoster: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80',
    campusVideoUrl: '',
    campusPoster: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80',
  },
};

function deepMerge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override ?? base;
  const result = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && base?.[key] && typeof base[key] === 'object') {
      result[key] = deepMerge(base[key], value);
    } else if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

/** Fetch public site settings, merged over defaults so the UI never breaks. */
export async function getSiteSettings() {
  const res = await apiFetch('/api/settings', { revalidate: 120 });
  return deepMerge(DEFAULT_SETTINGS, res.ok ? res.data : null);
}

export function formatAddress(address) {
  if (!address) return '';
  return [address.line1, address.line2, address.city, address.state, address.pincode, address.country]
    .filter(Boolean)
    .join(', ');
}
