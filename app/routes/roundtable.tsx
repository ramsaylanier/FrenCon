import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import RoundtableIdeas from "~/components/RoundtableIdeas";

export const meta: MetaFunction = () => [
  { title: "Roundtable Ideas - FrenCon 2026" },
  {
    name: "description",
    content: "Roundtable discussion topics for FrenCon",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) {
    throw redirect(
      `/signin?redirect=${encodeURIComponent(new URL(request.url).pathname)}`
    );
  }
  return { user };
}

export default function Roundtable() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <div className="space-y-3 px-2 py-3 md:space-y-6 md:px-4 md:py-6 h-full overflow-auto">
      <RoundtableIdeas user={user} />
    </div>
  );
}
