import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const BLOG_DIR = path.join(process.cwd(), "app/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  pubDate: Date;
  author?: string;
  content: string;
}

function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const slugs = getBlogSlugs();
  const posts: BlogPost[] = [];

  for (const slug of slugs) {
    const post = await getBlogPost(slug.replace(/\.md$/, ""));
    if (post) posts.push(post);
  }

  return posts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const processed = await remark().use(remarkHtml).process(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description,
    pubDate: data.pubDate ? new Date(data.pubDate) : new Date(),
    author: data.author,
    content: String(processed),
  };
}
