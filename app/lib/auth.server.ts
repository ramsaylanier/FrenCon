import { getApp } from "./firebase.server";
import { getAuth } from "firebase-admin/auth";
import type { AuthUser } from "./types";

export type { AuthUser };

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/__session=([^;]+)/);
  return match ? match[1] : null;
}

export async function getSessionUser(request: Request): Promise<AuthUser | null> {
  const app = getApp();
  if (!app) return null;

  const auth = getAuth(app);
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) return null;

  try {
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const user = await auth.getUser(decodedCookie.uid);

    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
    };
  } catch {
    return null;
  }
}
