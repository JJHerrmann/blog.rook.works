import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AUTHOR, SITE_URL } from "@/lib/constants";
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
      "@type": "Person",
      name: AUTHOR.name
    },
    keywords: post.tags.join(", ")
  };

  const shareUrl = `${SITE_URL}/posts/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  return (
    <article className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <img src={post.coverImage} alt={`Cover image for ${post.title}`} className="coverImageLarge" />
      <header className="stackCompact">
        <h1 className="pageTitle">{post.title}</h1>
        <div className="byline">
          <img src={AUTHOR.avatar} alt={AUTHOR.name} className="authorAvatar" />
          <span>
            By {AUTHOR.name} | {formatDate(post.date)}
          </span>
        </div>
        <p className="metaLine">
          <span>{post.readingTimeMinutes} min read</span>
        </p>
        <ul className="tagList">
          {post.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
        <div className="shareRow">
          <span className="shareLabel">Share</span>
          <a
            className="shareButton"
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            X
          </a>
          <a
            className="shareButton"
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            className="shareButton"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </header>
      <section className="postContent" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
