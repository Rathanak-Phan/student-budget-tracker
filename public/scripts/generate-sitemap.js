const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

const sitemap = new SitemapStream({ hostname: 'https://your-site.vercel.app' });

// Add all your URLs here
sitemap.write({ url: '/', changefreq: 'weekly', priority: 1.0 });
sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.8 });

sitemap.end();

// Output to /public/sitemap.xml
streamToPromise(sitemap).then((data) => {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  createWriteStream(sitemapPath).end(data);
  console.log('✅ Sitemap generated at public/sitemap.xml');
});
