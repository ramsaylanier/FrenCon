import { Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import SignUpForm from "~/components/SignUpForm";

export const meta: MetaFunction = () => [
  { title: "Sign Up - FrenCon 2026" },
  { name: "description", content: "Create a FrenCon account" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (user) return redirect("/");
  return {};
}

export default function SignUp() {
  return (
    <>
      <h1>Sign Up</h1>
      <SignUpForm />
      <p>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </>
  );
}
