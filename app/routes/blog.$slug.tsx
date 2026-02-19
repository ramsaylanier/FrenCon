import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { getBlogPost } from "~/lib/blog.server";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

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
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="text-muted-foreground text-sm">
          <time dateTime={post.pubDate.toISOString()}>
            {post.pubDate.toLocaleDateString()}
          </time>
          {post.author && ` — ${post.author}`}
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="[&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
    </Card>
  );
}
