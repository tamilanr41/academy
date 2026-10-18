import { safeGet } from '@/lib/api';
import { SectionHeading } from '@/components/ui/primitives';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { GalleryBrowser } from '@/components/site/GalleryBrowser';
import { IMAGES } from '@/lib/media';

export const metadata = {
  title: 'Gallery',
  description: 'A look inside our classrooms, events and student achievements.',
};

export default async function GalleryPage() {
  const items = await safeGet('/api/gallery', [], { revalidate: 120 });

  return (
    <div>
      <PageHero
        eyebrow="Life at the academy"
        title="A look inside"
        description="Classrooms, labs, celebrations and the moments that make learning here memorable."
        image={IMAGES.studyZones}
      />

      <div className="container-page py-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Photo gallery"
            title="Moments from our campus"
            description={items.length ? `${items.length} photos` : undefined}
          />
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <GalleryBrowser items={items} />
        </Reveal>
      </div>
    </div>
  );
}
