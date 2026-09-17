import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...getAllPosts().map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: new Date(post.date)
    }))
  ];
}
