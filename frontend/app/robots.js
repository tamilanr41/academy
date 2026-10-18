export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/dashboard'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
