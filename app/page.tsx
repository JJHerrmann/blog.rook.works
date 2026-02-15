import Link from "next/link";
import type { Metadata } from "next";
import { formatDate } from "@/lib/date";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

type HomePageProps = {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim().length > 0) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

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

export default function HomePage({ searchParams }: HomePageProps) {
  const posts = getAllPosts();
  const searchQuery = normalizeParam(searchParams?.q).trim();
  const activeTag = normalizeParam(searchParams?.tag).trim();
  const activeTagLower = activeTag.toLowerCase();
  const searchLower = searchQuery.toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchesTag = !activeTag || post.tags.some((tag) => tag.toLowerCase() === activeTagLower);
    if (!matchesTag) {
      return false;
    }
    if (!searchLower) {
      return true;
    }
    const haystack = [post.title, post.description, ...post.tags].join(" ").toLowerCase();
    return haystack.includes(searchLower);
  });

  const feedPosts = searchQuery || activeTag ? filteredPosts : posts;
  const latestPost = posts[0];
  const categoryMap = posts.reduce((acc, post) => {
    post.tags.forEach((tag) => {
      acc.set(tag, (acc.get(tag) ?? 0) + 1);
    });
    return acc;
  }, new Map<string, number>());
  const categories = Array.from(categoryMap, ([name, count]) => ({ name, count })).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });
  const hasFilters = Boolean(searchQuery || activeTag);
  const featuredPosts = hasFilters ? feedPosts : feedPosts.slice(0, 6);

  return (
    <section className="stack">
      <section className="hero">
        <div className="heroInner">
          <p className="eyebrow">The Rook's Work Desk</p>
          <h1 className="heroTitle">The Rook's Work Desk</h1>
          <p className="heroSubheading">Tools, writing, workflows, and ideas from the edge of craft.</p>
          <div className="heroActions">
            <Link className="ctaButton" href={latestPost ? `/posts/${latestPost.slug}` : "/"}>
              Read the latest
            </Link>
            <Link className="ctaGhost" href="#subscribe">
              Subscribe
            </Link>
          </div>
          <form className="searchForm" role="search" method="get">
            <label className="srOnly" htmlFor="search">
              Search posts
            </label>
            <input id="search" name="q" type="search" placeholder="Search posts" defaultValue={searchQuery} />
            {activeTag ? <input type="hidden" name="tag" value={activeTag} /> : null}
            <button type="submit">Search</button>
          </form>
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
            {hasFilters ? (
              <div className="filterRow">
                <span>
                  Showing {feedPosts.length} result{feedPosts.length === 1 ? "" : "s"}
                  {activeTag ? ` in ${activeTag}` : ""}.
                </span>
                <Link href="/" className="filterClear">
                  Clear
                </Link>
              </div>
            ) : null}
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
            {categories.length === 0 ? (
              <p className="emptyState">No categories yet.</p>
            ) : (
              <ul className="categoryList">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link
                      className={`categoryChip${activeTagLower === category.name.toLowerCase() ? " isActive" : ""}`}
                      href={buildQuery({ q: searchQuery, tag: category.name })}
                    >
                      <span>{category.name}</span>
                      <span className="categoryCount">{category.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="authorCard">
              <div className="authorTop">
                <img src={AUTHOR.avatar} alt={AUTHOR.name} className="authorAvatarLarge" />
                <div>
                  <p className="authorName">{AUTHOR.name}</p>
                  <p className="authorRole">{AUTHOR.role}</p>
                </div>
              </div>
              <p className="authorBio">{AUTHOR.bio}</p>
            </div>
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
