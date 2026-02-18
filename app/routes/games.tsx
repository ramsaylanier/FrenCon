import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import GameNominations from "~/components/GameNominations";

export const meta: MetaFunction = () => [
  { title: "Game Nominations - FrenCon 2026" },
  {
    name: "description",
    content: "Nominate board games to play at FrenCon",
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
    <>
      <h1>Game Nominations</h1>
      <p>
        Nominate games you'd like to play at FrenCon. Sign in to add your
        nominations.
      </p>
      <GameNominations user={user} />
    </>
  );
}
