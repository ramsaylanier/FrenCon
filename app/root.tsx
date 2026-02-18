import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSessionUser } from "./lib/auth.server";
import Nav from "./components/Nav";
import "./styles/global.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <>
      <header>
        <Nav user={user} />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>FrenCon 2026 — Board game convention</p>
      </footer>
    </>
  );
}
