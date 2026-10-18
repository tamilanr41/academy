import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { SectionHeading, Button } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { FaqAccordion } from '@/components/site/FaqAccordion';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about admissions, courses, payments and certificates.',
};

export default async function FaqPage() {
  const faqs = await safeGet('/api/faqs', [], { revalidate: 300 });

  return (
    <div>
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        description="Everything you need to know before you enrol. Can't find an answer? Our team is one message away."
        image={IMAGES.seminar}
      />

      <div className="container-page py-16">
        <Reveal>
          <FaqAccordion faqs={faqs} />
        </Reveal>

        <Reveal className="mt-16">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <MessageCircleQuestion className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Still have questions?</h2>
              <p className="mt-1 text-sm text-slate-500">Our admissions team is happy to help you choose the right course.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/contact">
                Contact us <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/apply" variant="secondary">
                Apply now
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
