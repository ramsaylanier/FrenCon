import { useRouteLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import VideosList from "~/components/VideosList";

export const meta: MetaFunction = () => [
  { title: "Videos - FrenCon 2026" },
  {
    name: "description",
    content: "FrenCon videos and recordings",
  },
];

export default function Videos() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <>
      <h1>Videos</h1>
      <p>
        Watch FrenCon videos and recordings. Sign in to add videos or view the
        collection.
      </p>
      <VideosList user={user} />
    </>
  );
}
