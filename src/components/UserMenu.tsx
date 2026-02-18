import type { AuthUser } from '../lib/auth';

interface UserMenuProps {
  user: AuthUser | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  if (!user) return null;

  return (
    <span>
      {user.email ?? user.displayName ?? 'User'}
      <form action="/api/auth/signout" method="get" style={{ display: 'inline' }}>
        <button type="submit">Sign Out</button>
      </form>
    </span>
  );
}
