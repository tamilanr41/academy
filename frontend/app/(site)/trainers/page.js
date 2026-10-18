import { Users, GraduationCap, Star } from 'lucide-react';
import { safeGet } from '@/lib/api';
import { SectionHeading, EmptyState } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { TrainerCard } from '@/components/site/Cards';
import { Reveal } from '@/components/site/Reveal';
import { Counter } from '@/components/site/Counter';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Our Trainers',
  description: 'Meet the industry practitioners who teach at our academy.',
};

export default async function TrainersPage() {
  const trainers = await safeGet('/api/trainers', [], { revalidate: 300 });

  const stats = [
    { icon: Users, value: Math.max(trainers.length, 4), suffix: '+', label: 'Expert mentors' },
    {
      icon: GraduationCap,
      value: Math.max(Math.round(trainers.reduce((sum, t) => sum + (t.experienceYears || 0), 0) / (trainers.length || 1)), 1),
      suffix: '+',
      label: 'Avg. years experience',
    },
    { icon: Star, value: 4.9, decimals: 1, suffix: '/5', label: 'Average rating' },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Mentors"
        title="Learn from practitioners, not just teachers"
        description="Every trainer brings years of hands-on industry experience — and mentors you personally through every project."
        image={IMAGES.lecture}
      />

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70} className="text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <stat.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-3xl font-black text-slate-900">
                <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="container-page py-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="The team"
            title="Meet our trainers"
            description="A collective of engineers, designers and analysts who still work in the field they teach."
          />
        </Reveal>
        <div className="mt-10">
          {trainers.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trainers.map((trainer, index) => (
                <Reveal key={trainer._id} delay={(index % 4) * 80}>
                  <TrainerCard trainer={trainer} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No trainers yet" description="Trainer profiles will appear here soon." />
          )}
        </div>
      </div>
    </div>
  );
}
