import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found."
    };
  }

  const canonicalPath = `/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonicalPath,
      publishedTime: `${post.date}T00:00:00.000Z`,
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          alt: `Cover image for ${post.title}`
        }
      ]
    }
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: `${post.date}T00:00:00.000Z`,
    dateModified: `${post.date}T00:00:00.000Z`,
    url: `${SITE_URL}/posts/${post.slug}`,
    image: `${SITE_URL}${post.coverImage}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME
    },
    keywords: post.tags.join(", ")
  };

  return (
    <article className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <img src={post.coverImage} alt={`Cover image for ${post.title}`} className="coverImageLarge" />
      <header className="stackCompact">
        <h1 className="pageTitle">{post.title}</h1>
        <p className="metaLine">
          <span>{formatDate(post.date)}</span>
          <span>{post.readingTimeMinutes} min read</span>
        </p>
        <ul className="tagList">
          {post.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      </header>
      <section className="postContent" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
