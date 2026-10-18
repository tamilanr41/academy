import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/site';
import { getCurrentUser } from '@/lib/api';

export default async function SiteLayout({ children }) {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  return (
    <div className="site-fonts flex min-h-screen flex-col">
      <Navbar settings={settings} user={user} />
      <main className="flex-1 pt-[72px] sm:pt-20">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
