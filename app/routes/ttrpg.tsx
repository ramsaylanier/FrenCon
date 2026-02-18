import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import TTRPGNominations from "~/components/TTRPGNominations";

export const meta: MetaFunction = () => [
  { title: "TTRPG Polling - FrenCon 2026" },
  {
    name: "description",
    content: "Nominate TTRPGs to play at FrenCon",
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
    <>
      <h1>TTRPG Nominations</h1>
      <p>
        Nominate tabletop RPGs you'd like to play. Sign in to add your
        nominations.
      </p>
      <TTRPGNominations user={user} />
    </>
  );
}
