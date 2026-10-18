import { getSiteSettings } from '@/lib/site';

export const metadata = { title: 'Privacy Policy', description: 'How we collect, use and protect your personal information.' };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const name = settings.academyName;

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="section-title">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Information we collect</h2>
          <p className="mt-2">
            When you enquire, apply or register, we collect the details you provide such as your name, email address, phone
            number, city and educational background. We also collect basic technical information needed to operate the website
            securely.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">2. How we use your information</h2>
          <p className="mt-2">
            We use your information to respond to enquiries, process applications, manage your enrolment, provide course
            updates and improve our services. We never sell your personal data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">3. Data security</h2>
          <p className="mt-2">
            We apply industry-standard safeguards — including encrypted credentials and access controls — to protect your data.
            Only authorised staff can access applicant and student records.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">4. Cookies</h2>
          <p className="mt-2">
            We use a secure, httpOnly session cookie solely to keep you signed in. It contains no advertising trackers.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">5. Your rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal data by contacting us at{' '}
            <span className="font-medium text-slate-900">{settings.contact?.email}</span>.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">6. Contact</h2>
          <p className="mt-2">For any privacy questions, reach out to {name} using the contact details on our website.</p>
        </section>
      </div>
    </div>
  );
}
