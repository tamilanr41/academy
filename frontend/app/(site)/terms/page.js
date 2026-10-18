import { getSiteSettings } from '@/lib/site';

export const metadata = { title: 'Terms of Service', description: 'The terms governing your use of our website and courses.' };

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="section-title">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of terms</h2>
          <p className="mt-2">By using this website or enrolling in a course, you agree to these terms.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">2. Enrolment & payment</h2>
          <p className="mt-2">
            Course fees, batch schedules and refund eligibility are stated on the relevant course page and confirmed at
            enrolment. Fees once paid are refundable only as per the applicable refund policy.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">3. Student conduct</h2>
          <p className="mt-2">
            Students are expected to attend sessions, respect trainers and peers, and refrain from sharing course material
            without permission.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">4. Intellectual property</h2>
          <p className="mt-2">
            All course content, materials and branding are the property of {settings.academyName} and may not be reproduced
            without written consent.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">5. Limitation of liability</h2>
          <p className="mt-2">
            While we work hard to support every learner, we cannot guarantee specific employment outcomes. Placements depend on
            individual effort, market conditions and employer decisions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900">6. Changes to terms</h2>
          <p className="mt-2">We may update these terms from time to time. Continued use of our services constitutes acceptance of the revised terms.</p>
        </section>
      </div>
    </div>
  );
}
