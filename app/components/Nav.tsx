import { Link } from "react-router";
import UserMenu from "./UserMenu";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { AuthUser } from "~/lib/types";

const navLinkClass =
  "text-foreground hover:text-foreground/80 hover:no-underline";

export default function Nav({ user }: { user: AuthUser | null }) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/" className={cn("font-semibold", navLinkClass)}>
          <img
            src="/frencon-logo.png"
            alt="FrenCon"
            className="h-6 w-auto"
          />
        </Link>
      </Button>
      {user && (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/games" className={navLinkClass}>
              Games
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/roundtable" className={navLinkClass}>
              Roundtable
            </Link>
          </Button>
        </>
      )}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/videos" className={navLinkClass}>
          Videos
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/blog" className={navLinkClass}>
          Blog
        </Link>
      </Button>

      <span className="ml-auto flex items-center gap-2">
        {user && <UserMenu user={user} />}
        {!user && (
          <Button size="sm" asChild>
            <Link to="/signin">Log In</Link>
          </Button>
        )}
      </span>
    </nav>
  );
}
