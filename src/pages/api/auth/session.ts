import type { APIRoute } from 'astro';
import { app } from '../../../firebase/server';
import { getAuth } from 'firebase-admin/auth';

export const GET: APIRoute = async ({ cookies }) => {
  const auth = getAuth(app);

  if (!cookies.has('__session')) {
    return new Response(
      JSON.stringify({ user: null }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const sessionCookie = cookies.get('__session')!.value;
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const user = await auth.getUser(decodedCookie.uid);

    if (!user) {
      return new Response(
        JSON.stringify({ user: null }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ user: null }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};
