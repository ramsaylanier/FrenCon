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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="grid grid-rows-[50px_1fr_50px] h-[100dvh] overflow-hidden">
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
      <header className="border-b border-border py-2 px-2">
        <Nav user={user} />
      </header>
      <main className="h-full overflow-hidden">
        <Outlet />
      </main>
      <footer className="flex items-center justify-center text-sm bg-primary">
        <p className="text-primary-foreground">FrenCon 2026 — Board game convention</p>
      </footer>
    </>
  );
}
