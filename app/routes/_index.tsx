import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "FrenCon 2026" },
  { name: "description", content: "Board game convention for friends" },
];

export default function Index() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">FrenCon 2026</h1>
        <p className="text-muted-foreground">
          A board game convention for friends.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Get Started</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/games" className="text-primary underline-offset-4 hover:underline">
              Board Games
            </Link>{" "}
            — Add games and vote
          </li>
          <li>
            <Link to="/roundtable" className="text-primary underline-offset-4 hover:underline">
              Roundtable Ideas
            </Link>{" "}
            — Propose discussion topics
          </li>
          <li>
            <Link to="/ttrpg" className="text-primary underline-offset-4 hover:underline">
              TTRPGs
            </Link>{" "}
            — Add TTRPGs and vote
          </li>
          <li>
            <Link to="/polling" className="text-primary underline-offset-4 hover:underline">
              Polling Results
            </Link>{" "}
            — See poll rankings
          </li>
          <li>
            <Link to="/merch" className="text-primary underline-offset-4 hover:underline">
              Merchandise
            </Link>{" "}
            — Suggest merch ideas
          </li>
          <li>
            <Link to="/videos" className="text-primary underline-offset-4 hover:underline">
              Videos
            </Link>{" "}
            — Watch FrenCon videos
          </li>
          <li>
            <Link to="/blog" className="text-primary underline-offset-4 hover:underline">
              Blog
            </Link>{" "}
            — Read the latest updates
          </li>
          <li>
            <Link to="/profile" className="text-primary underline-offset-4 hover:underline">
              Profile
            </Link>{" "}
            — Update dietary & travel preferences
          </li>
        </ul>
      </div>

      <p className="text-muted-foreground">
        <Link to="/signin" className="text-primary underline-offset-4 hover:underline">
          Log in
        </Link>{" "}
        to participate. Don't have an account?{" "}
        <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
        .
      </p>
    </div>
  );
}
