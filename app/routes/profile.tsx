import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import ProfileForm from "~/components/ProfileForm";

export const meta: MetaFunction = () => [
  { title: "Profile - FrenCon 2026" },
  {
    name: "description",
    content: "Update your FrenCon profile and preferences",
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

export default function Profile() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <>
      <h1>Your Profile</h1>
      <p>
        Update your display name, dietary restrictions, and travel preferences.
      </p>
      <ProfileForm user={user} />
    </>
  );
}
