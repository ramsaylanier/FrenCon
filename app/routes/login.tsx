import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectParam = url.searchParams.get("redirect");
  const signinUrl = redirectParam
    ? `/signin?redirect=${encodeURIComponent(redirectParam)}`
    : "/signin";
  return redirect(signinUrl);
}
