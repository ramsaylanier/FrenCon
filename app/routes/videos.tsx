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
    <div className="space-y-6 px-4 py-6 h-full overflow-hidden">
      <VideosList user={user} />
    </div>
  );
}
