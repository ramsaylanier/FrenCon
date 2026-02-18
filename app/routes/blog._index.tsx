import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { getBlogPosts } from "~/lib/blog.server";

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
    <>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            <small>
              {post.pubDate.toLocaleDateString()}
              {post.author && ` — ${post.author}`}
            </small>
          </li>
        ))}
      </ul>
    </>
  );
}
