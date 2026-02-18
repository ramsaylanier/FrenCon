import { app } from '../firebase/server';
import { getAuth } from 'firebase-admin/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export async function getSessionUser(
  cookies: { has: (name: string) => boolean; get: (name: string) => { value: string } | undefined }
): Promise<AuthUser | null> {
  const auth = getAuth(app);

  if (!cookies.has('__session')) {
    return null;
  }

  try {
    const sessionCookie = cookies.get('__session')!.value;
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

export async function isAuthenticated(
  cookies: { has: (name: string) => boolean; get: (name: string) => { value: string } | undefined }
): Promise<boolean> {
  return (await getSessionUser(cookies)) !== null;
}

export async function getAuthenticatedUser(
  cookies: { has: (name: string) => boolean; get: (name: string) => { value: string } | undefined }
): Promise<AuthUser | null> {
  return await getSessionUser(cookies);
}