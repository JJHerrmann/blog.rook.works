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
  const featuredPosts = posts.slice(0, 3);
  const latestPost = posts[0];
  const categories = ["Systems", "Workflows", "Stories"];

  return (
    <section className="stack">
      <section className="hero">
        <div className="heroInner">
          <p className="eyebrow">The Rook’s Work Desk</p>
          <h1 className="heroTitle">The Rook’s Work Desk</h1>
          <p className="heroSubheading">Tools, writing, workflows, and ideas from the edge of craft.</p>
          <div className="heroActions">
            <Link className="ctaButton" href={latestPost ? `/posts/${latestPost.slug}` : "/"}>
              Read the latest
            </Link>
            <Link className="ctaGhost" href="#subscribe">
              Subscribe
            </Link>
          </div>
        </div>
      </section>

      <section className="stack">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Featured</h2>
          <p className="sectionSubheading">Latest posts and curated categories.</p>
        </div>

        <div className="featuredGrid">
          <div className="featuredMain">
            <h3 className="panelTitle">Latest Posts</h3>
            {featuredPosts.length === 0 ? (
              <p className="emptyState">No posts found in content/posts yet.</p>
            ) : (
              <div className="postGrid">
                {featuredPosts.map((post) => (
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
                      <h4 className="cardTitle">
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h4>
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
          </div>

          <aside className="featuredAside">
            <h3 className="panelTitle">Categories</h3>
            <ul className="categoryList">
              {categories.map((category) => (
                <li key={category} className="categoryChip">
                  {category}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="aboutSection stackCompact">
        <h2 className="sectionTitle">About</h2>
        <p>
          A quiet workshop for systems-minded writing, the tools behind the work, and the craft of shipping good ideas.
        </p>
        <Link className="textLink" href={latestPost ? `/posts/${latestPost.slug}` : "/"}>
          Read the latest essay
        </Link>
      </section>

      <section className="subscribeSection stackCompact" id="subscribe">
        <h2 className="sectionTitle">Subscribe</h2>
        <p>Get new posts in your inbox. No spam, just the work desk.</p>
        <form className="subscribeForm">
          <label className="srOnly" htmlFor="email">
            Email address
          </label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
          <button type="submit">Notify me</button>
        </form>
        <p className="formNote">Email capture is placeholder until a provider is wired up.</p>
      </section>

      <footer className="siteFooter">
        <div className="footerNav">
          <Link href="/">Home</Link>
          <Link href="/rss.xml">RSS</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </div>
        <div className="footerNav">
          <a href="https://github.com/JJHerrmann/blog.rook.works">GitHub</a>
          <a href="https://github.com/JJHerrmann">Social</a>
        </div>
        <p className="footerCredits">Built with Next.js. Published at blog.rook.works.</p>
      </footer>
    </section>
  );
}
