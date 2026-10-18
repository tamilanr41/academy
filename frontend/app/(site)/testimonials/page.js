import { Quote, Star, ArrowRight } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { SectionHeading, EmptyState, Button } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { TestimonialCard } from '@/components/site/Cards';
import { Reveal } from '@/components/site/Reveal';
import { Counter } from '@/components/site/Counter';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Testimonials',
  description: 'Hear from students who transformed their careers with us.',
};

export default async function TestimonialsPage() {
  const testimonials = await safeGet('/api/testimonials', [], { revalidate: 120 });

  const rated = testimonials.filter((t) => t.rating > 0);
  const avg = rated.length ? (rated.reduce((sum, t) => sum + t.rating, 0) / rated.length).toFixed(1) : '5.0';

  return (
    <div>
      <PageHero
        eyebrow="Success stories"
        title="Real students. Real outcomes."
        description="Honest words from learners who put in the work and transformed their careers."
        image={IMAGES.graduation}
      />

      {/* Rating summary */}
      {testimonials.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-10">
          <div className="container-page grid gap-8 sm:grid-cols-2">
            <Reveal className="text-center">
              <p className="text-4xl font-black text-slate-900">
                <Counter value={Number(avg)} decimals={1} suffix=" / 5" />
              </p>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">Average rating</p>
            </Reveal>
            <Reveal delay={80} className="text-center">
              <p className="text-4xl font-black text-slate-900">
                <Counter value={testimonials.length} suffix="+" />
              </p>
              <p className="mt-3 text-sm text-slate-500">Verified reviews</p>
            </Reveal>
          </div>
        </section>
      )}

      <div className="container-page py-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="In their words"
            title="What our students say"
            description="Learnings, career pivots and the results that followed."
          />
        </Reveal>

        <div className="mt-10">
          {testimonials.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial._id} delay={(index % 3) * 80} className="h-full">
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Quote} title="No testimonials yet" description="Approved student reviews will appear here." />
          )}
        </div>

        {/* CTA */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-brand-600/10 bg-blush-100 px-8 py-12 text-center sm:px-14">
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-2xl text-brand-700 sm:text-3xl">Ready to write your own success story?</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">Join thousands of learners who turned focused practice into a career.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button href="/apply">
                  Apply now <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/courses" variant="secondary">
                  Browse courses
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
