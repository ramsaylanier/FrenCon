import { Link, useLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import { getBlogPosts } from "~/lib/blog.server";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export const meta: MetaFunction = () => [
  { title: "Blog - FrenCon 2026" },
  {
    name: "description",
    content: "FrenCon blog posts",
  },
];

export async function loader() {
  const posts = await getBlogPosts();
  return { posts };
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 px-4 py-6 h-full overflow-auto">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-muted-foreground">
          Latest updates and news from FrenCon.
        </p>
      </div>
      <Card>

        <CardContent>
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="text-muted-foreground text-sm">
                  {post.pubDate.toLocaleDateString()}
                  {post.author && ` — ${post.author}`}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
