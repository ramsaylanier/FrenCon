import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/", {
    headers: {
      "Set-Cookie":
        "__session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
