import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import type { MetaFunction } from "react-router";

export async function loader() {
  throw new Response(null, { status: 404, statusText: "Not Found" });
}

export const meta: MetaFunction = () => [
  { title: "Page Not Found | FrenCon 2026" },
  { name: "robots", content: "noindex" },
];

function NotFoundContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundContent />;
  }
  throw error;
}

export default function NotFound() {
  return <NotFoundContent />;
}
