import { Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import SignInForm from "~/components/SignInForm";

export const meta: MetaFunction = () => [
  { title: "Log In - FrenCon 2026" },
  { name: "description", content: "Sign in to FrenCon" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (user) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirect") || "/";
    return redirect(redirectTo);
  }
  return {};
}

export default function SignIn() {
  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", border: "1px solid #eee", borderRadius: 8 }}>
      <h1 style={{ marginTop: 0 }}>Log In</h1>
      <p>Sign in to nominate games, add roundtable ideas, and more.</p>
      <SignInForm />
      <p style={{ marginTop: "1.5rem", marginBottom: 0 }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
