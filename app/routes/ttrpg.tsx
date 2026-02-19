import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import TTRPGList from "~/components/TTRPGList";

export const meta: MetaFunction = () => [
  { title: "TTRPGs - FrenCon 2026" },
  {
    name: "description",
    content: "TTRPGs to play at FrenCon. Add games and vote.",
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

export default function TTRPG() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">TTRPGs</h1>
        <p className="text-muted-foreground">
          Add TTRPGs and vote for what you'd like to play at FrenCon.
        </p>
      </div>
      <TTRPGList user={user} />
    </div>
  );
}
