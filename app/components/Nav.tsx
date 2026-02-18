import { Link } from "react-router";
import UserMenu from "./UserMenu";
import type { AuthUser } from "~/lib/types";

export default function Nav({ user }: { user: AuthUser | null }) {
  return (
    <nav>
      <Link to="/">FrenCon</Link>
      {user && ( 
        <>
          <Link to="/games">Games</Link>
          <Link to="/polling">Polling</Link>
          <Link to="/roundtable">Roundtable</Link>
          <Link to="/ttrpg">TTRPG</Link>
        </>
      )}
      <Link to="/videos">Videos</Link>
      <Link to="/blog">Blog</Link>

      {user && (
        <>
          <Link to="/profile">Profile</Link>
          <UserMenu user={user} />
        </>
      )}
      {!user && <Link to="/signin">Log In</Link>}
    </nav>
  );
}
