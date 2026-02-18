import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "FrenCon 2026" },
  { name: "description", content: "Board game convention for friends" },
];

export default function Index() {
  return (
    <>
      <h1>FrenCon 2026</h1>
      <p>A board game convention for friends.</p>

      <h2>Get Started</h2>
      <ul>
        <li>
          <Link to="/games">Nominate Games</Link> — Suggest board games to play
        </li>
        <li>
          <Link to="/roundtable">Roundtable Ideas</Link> — Propose discussion
          topics
        </li>
        <li>
          <Link to="/ttrpg">TTRPG Polling</Link> — Nominate tabletop RPGs
        </li>
        <li>
          <Link to="/polling">Polling Results</Link> — See how nominations rank
        </li>
        <li>
          <Link to="/merch">Merchandise</Link> — Suggest merch ideas
        </li>
        <li>
          <Link to="/videos">Videos</Link> — Watch FrenCon videos
        </li>
        <li>
          <Link to="/blog">Blog</Link> — Read the latest updates
        </li>
        <li>
          <Link to="/profile">Profile</Link> — Update dietary & travel
          preferences
        </li>
      </ul>

      <p>
        <Link to="/signin">Log in</Link> to participate. Don't have an
        account? <Link to="/signup">Sign up</Link>.
      </p>
    </>
  );
}
