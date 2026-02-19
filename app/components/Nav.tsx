import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import UserMenu from "./UserMenu";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { AuthUser } from "~/lib/types";

const navLinkClass =
  "text-foreground hover:text-foreground/80 hover:no-underline";

const navLinks = [
  { to: "/games", label: "Games", authOnly: true },
  { to: "/roundtable", label: "Roundtable", authOnly: true },
  { to: "/videos", label: "Videos", authOnly: false },
  { to: "/blog", label: "Blog", authOnly: false },
];

function NavLinks({ user, className }: { user: AuthUser | null; className?: string }) {
  return (
    <>
      {navLinks
        .filter((link) => !link.authOnly || user)
        .map((link) => (
          <Button key={link.to} variant="ghost" size="sm" asChild>
            <Link to={link.to} className={cn(navLinkClass, className)}>
              {link.label}
            </Link>
          </Button>
        ))}
    </>
  );
}

export default function Nav({ user }: { user: AuthUser | null }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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

      {/* Desktop nav links - hidden on mobile */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <NavLinks user={user} />
      </div>

      {/* Mobile menu - hamburger + sheet (client-only to avoid hydration mismatch with Sheet portal) */}
      <span className="ml-auto flex md:hidden">
        {isMounted ? (
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-1">
                <NavLinks user={user} className="flex w-full justify-start px-0 py-3 text-base" />
              </div>
              <div className="border-t p-4 mt-4">
                {user && <UserMenu user={user} />}
                {!user && (
                  <Button size="sm" asChild className="w-full">
                    <Link to="/signin">Log In</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        ) : (
          <div
            className="inline-flex size-9 items-center justify-center"
            aria-hidden
          >
            <MenuIcon className="size-5" />
          </div>
        )}
      </span>

      {/* Desktop user actions - hidden on mobile */}
      <span className="ml-auto hidden md:flex items-center gap-2">
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
