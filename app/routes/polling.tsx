import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import PollingResults from "~/components/PollingResults";

export const meta: MetaFunction = () => [
  { title: "Polling Results - FrenCon 2026" },
  {
    name: "description",
    content: "Poll results for games and TTRPGs",
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

export default function Polling() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <>
      <h1>Polling Results</h1>
      <p>See how the nominations are ranking. Sign in to view.</p>
      <PollingResults user={user} />
    </>
  );
}
