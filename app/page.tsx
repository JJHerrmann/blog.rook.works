import Link from "next/link";
import type { Metadata } from "next";
import { formatDate } from "@/lib/date";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

export function generateMetadata(): Metadata {
  const posts = getAllPosts();
  const defaultImage = posts[0]?.coverImage;

  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: "/",
      images: defaultImage
        ? [
            {
              url: defaultImage,
              alt: SITE_NAME
            }
          ]
        : undefined
    }
  };
}

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <section className="stack">
      <header className="stackCompact">
        <h1 className="pageTitle">Latest Posts</h1>
      </header>

      {posts.length === 0 ? (
        <p className="emptyState">No posts found in content/posts yet.</p>
      ) : (
        <div className="postGrid">
          {posts.map((post) => (
            <article key={post.slug} className="postCard">
              <Link href={`/posts/${post.slug}`} aria-label={`Read ${post.title}`}>
                <img
                  src={post.coverImage}
                  alt={`Cover image for ${post.title}`}
                  className="coverImage"
                  loading="lazy"
                />
              </Link>
              <div className="stackCompact">
                <p className="metaLine">{formatDate(post.date)}</p>
                <h2 className="cardTitle">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
                <ul className="tagList">
                  {post.tags.map((tag) => (
                    <li key={tag} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
