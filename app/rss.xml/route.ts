import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

const MAX_ITEMS = 20;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const posts = getAllPosts().slice(0, MAX_ITEMS);

  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/posts/${post.slug}`;
      const pubDate = new Date(`${post.date}T00:00:00.000Z`).toUTCString();
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${postUrl}</link>
  <guid>${postUrl}</guid>
  <description>${escapeXml(post.description)}</description>
  <pubDate>${pubDate}</pubDate>
</item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${SITE_URL}</link>
  <description>${escapeXml(SITE_DESCRIPTION)}</description>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
