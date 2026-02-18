import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import MerchIdeas from "~/components/MerchIdeas";

export const meta: MetaFunction = () => [
  { title: "Merchandise Ideas - FrenCon 2026" },
  {
    name: "description",
    content: "Suggest merchandise for FrenCon",
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

export default function Merch() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <>
      <h1>Merchandise Ideas</h1>
      <p>Suggest merchandise ideas for FrenCon. Sign in to add your suggestions.</p>
      <MerchIdeas user={user} />
    </>
  );
}
