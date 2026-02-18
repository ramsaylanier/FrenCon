import { useAuth } from './AuthProvider';
import { UserMenu } from './UserMenu';

export function Nav() {
  const { user, loading } = useAuth();

  return (
    <nav>
      {loading && <p>Loading...</p>}
      <a href="/">FrenCon</a>
      {!loading && user && (
        <>
          <a href="/games">Games</a>
          <a href="/polling">Polling</a>
          <a href="/roundtable">Roundtable</a>
          <a href="/ttrpg">TTRPG</a>
        </>
      )}
      <a href="/merch">Merch</a>
      <a href="/videos">Videos</a>
      <a href="/blog">Blog</a>
      <a href="/profile">Profile</a>
      {!loading && !user && <a href="/login">Log In</a>}
      <UserMenu />
    </nav>
  );
}
