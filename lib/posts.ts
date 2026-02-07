import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 225;

export type PostFrontmatter = {
  title: string;
  slug: string;
  date: string;
  description: string;
  tags: string[];
  coverImage: string;
};

export type PostSummary = PostFrontmatter & {
  readingTimeMinutes: number;
};

export type Post = PostSummary & {
  content: string;
  html: string;
};

type ParsedPost = PostSummary & {
  content: string;
};

function assertString(value: unknown, field: string, fileName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid "${field}" in ${fileName}`);
  }
  return value.trim();
}

function assertTags(value: unknown, fileName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid "tags" in ${fileName}. Expected a non-empty array.`);
  }

  const tags = value.map((tag) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      throw new Error(`Invalid tag value in ${fileName}`);
    }
    return tag.trim();
  });

  return tags;
}

function normalizeDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return null;
}

function assertDate(value: unknown, fileName: string): string {
  const date = normalizeDate(value);
  if (!date) {
    throw new Error(`Invalid "date" in ${fileName}`);
  }
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`Invalid "date" format in ${fileName}. Expected YYYY-MM-DD.`);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid "date" value in ${fileName}`);
  }

  return date;
}

function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function parsePostFile(fileName: string): ParsedPost {
  const fullPath = path.join(POSTS_DIR, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);

  const frontmatter: PostFrontmatter = {
    title: assertString(data.title, "title", fileName),
    slug: assertString(data.slug, "slug", fileName),
    date: assertDate(data.date, fileName),
    description: assertString(data.description, "description", fileName),
    tags: assertTags(data.tags, fileName),
    coverImage: assertString(data.coverImage, "coverImage", fileName)
  };

  return {
    ...frontmatter,
    content,
    readingTimeMinutes: calculateReadingTime(content)
  };
}

function getMarkdownFileNames(): string[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs.readdirSync(POSTS_DIR).filter((fileName) => fileName.endsWith(".md"));
}

export function getAllPosts(): PostSummary[] {
  const posts = getMarkdownFileNames().map((fileName) => parsePostFile(fileName));

  return posts
    .sort((a, b) => new Date(`${b.date}T00:00:00.000Z`).getTime() - new Date(`${a.date}T00:00:00.000Z`).getTime())
    .map(({ content, ...summary }) => summary);
}

async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const parsed = getMarkdownFileNames()
    .map((fileName) => parsePostFile(fileName))
    .find((post) => post.slug === slug);

  if (!parsed) {
    return null;
  }

  const html = await markdownToHtml(parsed.content);

  return {
    ...parsed,
    html
  };
}
