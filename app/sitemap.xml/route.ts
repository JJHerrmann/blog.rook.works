import { SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

function buildAbsoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname}`;
}

export function GET() {
  const posts = getAllPosts();
  const urls = [
    { loc: buildAbsoluteUrl("/"), lastmod: new Date().toISOString() },
    ...posts.map((post) => ({
      loc: buildAbsoluteUrl(`/posts/${post.slug}`),
      lastmod: `${post.date}T00:00:00.000Z`
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
