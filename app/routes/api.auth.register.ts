import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getAuth } from "firebase-admin/auth";
import { app } from "~/lib/firebase.server";

export async function action({ request }: ActionFunctionArgs) {
  const auth = getAuth(app);

  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();

  if (!email || !password || !name) {
    return new Response("Missing form data", { status: 400 });
  }

  try {
    await auth.createUser({
      email,
      password,
      displayName: name,
    });
  } catch {
    return new Response("Something went wrong", { status: 400 });
  }
  return redirect("/signin");
}
