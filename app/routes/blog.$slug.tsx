import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { getBlogPost } from "~/lib/blog.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "Post Not Found" }];
  return [
    { title: `${data.post.title} - FrenCon 2026` },
    {
      name: "description",
      content: data.post.description ?? data.post.title,
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getBlogPost(params.slug!);
  if (!post) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  return { post };
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>
        <time dateTime={post.pubDate.toISOString()}>
          {post.pubDate.toLocaleDateString()}
        </time>
        {post.author && ` — ${post.author}`}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
