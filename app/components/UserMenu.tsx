import { Form } from "react-router";
import type { AuthUser } from "~/lib/types";

interface UserMenuProps {
  user: AuthUser | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  if (!user) return null;

  return (
    <span>
      {user.email ?? user.displayName ?? "User"}
      <Form action="/api/auth/signout" method="get" style={{ display: "inline" }}>
        <button type="submit">Sign Out</button>
      </Form>
    </span>
  );
}
