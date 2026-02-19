import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getAuth } from "firebase-admin/auth";
import { getApp } from "~/lib/firebase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const app = getApp();
  if (!app) return new Response("Auth unavailable", { status: 503 });
  const auth = getAuth(app);

  const idToken = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!idToken) {
    return new Response("No token found", { status: 401 });
  }

  try {
    await auth.verifyIdToken(idToken);
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  const fiveDays = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: fiveDays,
  });

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": `__session=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax`,
    },
  });
}
