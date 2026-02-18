import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import type { AuthUser } from "~/lib/types";

interface GameNomination {
  id: string;
  gameName: string;
  votes: number;
  nominatedBy: string;
}

interface TTRPGNomination {
  id: string;
  gameName: string;
  votes: number;
  nominatedBy: string;
}

interface PollingResultsProps {
  user: AuthUser | null;
}

export default function PollingResults({ user }: PollingResultsProps) {
  const [games, setGames] = useState<GameNomination[]>([]);
  const [ttrpgs, setTtrpgs] = useState<TTRPGNomination[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gamesQuery = query(
      collection(db, "gameNominations"),
      orderBy("votes", "desc")
    );
    const ttrpgQuery = query(
      collection(db, "ttrpgNominations"),
      orderBy("votes", "desc")
    );

    const unsubGames = onSnapshot(
      gamesQuery,
      (snapshot) => {
        setGames(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            gameName: doc.data().gameName,
            votes: doc.data().votes ?? 0,
            nominatedBy: doc.data().nominatedBy,
          }))
        );
      },
      (err) => setError(err.message)
    );

    const unsubTtrpg = onSnapshot(
      ttrpgQuery,
      (snapshot) => {
        setTtrpgs(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            gameName: doc.data().gameName,
            votes: doc.data().votes ?? 0,
            nominatedBy: doc.data().nominatedBy,
          }))
        );
      },
      (err) => setError(err.message)
    );

    return () => {
      unsubGames();
      unsubTtrpg();
    };
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Board Game Poll Results</h2>
      <ol>
        {games.map((g) => (
          <li key={g.id}>
            <strong>{g.gameName}</strong> — {g.votes} votes (by {g.nominatedBy})
          </li>
        ))}
      </ol>
      {games.length === 0 && <p>No nominations yet.</p>}

      <h2>TTRPG Poll Results</h2>
      <ol>
        {ttrpgs.map((g) => (
          <li key={g.id}>
            <strong>{g.gameName}</strong> — {g.votes} votes (by {g.nominatedBy})
          </li>
        ))}
      </ol>
      {ttrpgs.length === 0 && <p>No nominations yet.</p>}
    </div>
  );
}
