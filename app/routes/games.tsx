import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import BoardGamesList from "~/components/BoardGamesList";

export const meta: MetaFunction = () => [
  { title: "Board Games - FrenCon 2026" },
  {
    name: "description",
    content: "Board games to play at FrenCon. Add games and vote.",
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

export default function Games() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;
 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Board Games</h1>
        <p className="text-muted-foreground">
          Add board games and vote for what you'd like to play at FrenCon.
        </p>
      </div>
      <BoardGamesList user={user} />
    </div>
  );
}
