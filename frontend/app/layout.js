import './globals.css';
import { Inter, Libre_Baskerville } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import { getSiteSettings } from '@/lib/site';
import { SITE_URL } from '@/lib/api';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const libre = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-libre',
  display: 'swap',
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const title = settings?.seo?.metaTitle || settings?.academyName || 'Academy';
  const description = settings?.seo?.metaDescription || settings?.tagline || '';
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${settings?.academyName || 'Academy'}`,
    },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL,
      siteName: settings?.academyName,
    },
    twitter: { card: 'summary_large_image', title, description },
    icons: settings?.favicon?.url ? { icon: settings.favicon.url } : undefined,
  };
}

export const viewport = {
  themeColor: '#5c1303',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${libre.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
