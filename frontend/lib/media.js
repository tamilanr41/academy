/**
 * Curated remote imagery (Unsplash) used across the public site.
 *
 * Every id below has been verified to resolve to a real image. Images are
 * requested from the Unsplash CDN at the exact size we render, so next/image
 * can optimise and cache them. Swap any entry for your own asset by pointing
 * the key at a local path (e.g. '/images/campus.jpg').
 */

export function unsplash(id, w = 1600, q = 80) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/** Generic, high-impact photos for hero, about, CTA and feature blocks. */
export const IMAGES = {
  heroStudents: unsplash('1523240795612-9a054b0db644', 1600),
  classroom: unsplash('1524178232363-1fb2b075b655', 1600),
  classroomAlt: unsplash('1517486808906-6ca8b3f04846', 1600),
  campus: unsplash('1541339907198-e08756dedf3f', 1600),
  library: unsplash('1562774053-701939374585', 1600),
  coding: unsplash('1606761568499-6d2451b23c66', 1600),
  teamLaptops: unsplash('1519389950473-47ba0277781c', 1600),
  meeting: unsplash('1552581234-26160f608093', 1600),
  teamwork: unsplash('1521737711867-e3b97375f902', 1600),
  lecture: unsplash('1550439062-609e1531270e', 1600),
  workshop: unsplash('1524995997946-a1c2e315a42f', 1600),
  seminar: unsplash('1516321318423-f06f85e504b3', 1600),
  lab: unsplash('1517245386807-bb43f82c33c4', 1600),
  presentation: unsplash('1531482615713-2afd69097998', 1600),
  studyZones: unsplash('1522202176988-66273c2fd55f', 1600),
  mentorReview: unsplash('1552664730-d307ca884978', 1600),
  graduation: unsplash('1523580494863-6f3031224c94', 1600),
  event: unsplash('1540575467063-178a50c2df87', 1600),
  business: unsplash('1454165804606-c3d57bc86b40', 1600),
  analytics: unsplash('1551288049-bebda4e38f71', 1600),
  security: unsplash('1526374965328-7f61d4dc18c5', 1600),
  cloud: unsplash('1667372393119-3d4c48d07fc9', 1600),
  design: unsplash('1581291518857-4e27b48ff24e', 1600),
  webdev: unsplash('1461749280684-dccba630e2f6', 1600),
};

/** Imagery matched to learning tracks (used on the home + courses pages). */
export const TRACK_IMAGES = {
  'web-development': IMAGES.webdev,
  'data-ai': IMAGES.analytics,
  design: IMAGES.design,
  'cloud-devops': IMAGES.cloud,
  'business-marketing': IMAGES.business,
  'cyber-security': IMAGES.security,
};

/** A tidy mosaic used for the campus reel and gallery previews. */
export const CAMPUS_MOSAIC = [
  { src: IMAGES.classroom, alt: 'Mentor-led classroom session' },
  { src: IMAGES.lab, alt: 'Students in the computer lab' },
  { src: IMAGES.presentation, alt: 'Capstone project presentation day' },
  { src: IMAGES.studyZones, alt: 'Collaborative study zones' },
  { src: IMAGES.graduation, alt: 'Graduation day' },
  { src: IMAGES.mentorReview, alt: 'One-on-one mentor review' },
];

export const DEFAULT_HERO_IMAGES = [IMAGES.heroStudents, IMAGES.classroom, IMAGES.coding];
