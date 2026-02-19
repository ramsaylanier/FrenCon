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
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Log In</h1>
        <p className="text-muted-foreground">
          Sign in to nominate games, add roundtable ideas, and more.
        </p>
      </div>
      <SignInForm />
      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
