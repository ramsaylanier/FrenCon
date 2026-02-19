import { Form, Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import type { AuthUser } from "~/lib/types";

interface UserMenuProps {
  user: AuthUser | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  if (!user) return null;

  const displayName = user.email ?? user.displayName ?? "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          {displayName}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <Form action="/api/auth/signout" method="get" className="contents">
          <DropdownMenuItem asChild>
            <Button type="submit" className="w-full cursor-default">
              Sign Out
            </Button>
          </DropdownMenuItem>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
