import UserMenu from './UserMenu';
import type { AuthUser } from '../lib/auth';

interface NavProps {
  user: AuthUser | null;
}

export default function Nav({ user }: NavProps) {
  return (
    <nav>
      <a href="/">FrenCon</a>
      {user && (
        <>
          <a href="/games">Games</a>
          <a href="/polling">Polling</a>
          <a href="/roundtable">Roundtable</a>
          <a href="/ttrpg">TTRPG</a>
        </>
      )}
      {/* <a href="/merch">Merch</a> */}
      <a href="/videos">Videos</a>
      <a href="/blog">Blog</a>

      {user && (
        <>
          <a href="/profile">Profile</a>
          <UserMenu user={user} />
        </>
      )}
      {!user && <a href="/login">Log In</a>}

    </nav>
  );
}
