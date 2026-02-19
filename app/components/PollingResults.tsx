import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { AuthUser } from "~/lib/types";
import type { BoardGame, TTRPG } from "~/lib/types";

interface GameWithTotal {
  id: string;
  title: string;
  total: number;
  boardGameGeekLink?: string;
  weight?: string;
  playerCount?: string;
}

interface TTRPGWithTotal {
  id: string;
  title: string;
  total: number;
  vibe?: string;
  style?: string;
  category?: string;
}

interface PollingResultsProps {
  user: AuthUser | null;
}

export default function PollingResults({ user }: PollingResultsProps) {
  const [boardGames, setBoardGames] = useState<BoardGame[]>([]);
  const [ttrpgs, setTtrpgs] = useState<TTRPG[]>([]);
  const [votes, setVotes] = useState<Map<string, { gameId: string; gameType: string; vote: number }>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubBoardGames = onSnapshot(
      collection(db, "boardGames"),
      (snapshot) => {
        setBoardGames(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as BoardGame[]
        );
      },
      (err) => setError(err.message)
    );

    const unsubTtrpgs = onSnapshot(
      collection(db, "ttrpgs"),
      (snapshot) => {
        setTtrpgs(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TTRPG[]
        );
      },
      (err) => setError(err.message)
    );

    const unsubVotes = onSnapshot(
      query(
        collection(db, "userVotes"),
        where("gameType", "in", ["boardGame", "ttrpg"])
      ),
      (snapshot) => {
        const map = new Map<string, { gameId: string; gameType: string; vote: number }>();
        snapshot.docs.forEach((d) => {
          const data = d.data();
          map.set(d.id, {
            gameId: data.gameId,
            gameType: data.gameType,
            vote: data.vote ?? 0,
          });
        });
        setVotes(map);
      },
      (err) => setError(err.message)
    );

    return () => {
      unsubBoardGames();
      unsubTtrpgs();
      unsubVotes();
    };
  }, []);

  const boardGamesWithTotal = useMemo<GameWithTotal[]>(() => {
    return boardGames.map((game) => {
      let total = 0;
      votes.forEach((v) => {
        if (v.gameType === "boardGame" && v.gameId === game.id) {
          total += v.vote;
        }
      });
      return {
        id: game.id,
        title: game.title,
        total,
        boardGameGeekLink: game.boardGameGeekLink,
        weight: game.weight,
        playerCount: game.playerCount,
      };
    }).sort((a, b) => b.total - a.total);
  }, [boardGames, votes]);

  const ttrpgsWithTotal = useMemo<TTRPGWithTotal[]>(() => {
    return ttrpgs.map((game) => {
      let total = 0;
      votes.forEach((v) => {
        if (v.gameType === "ttrpg" && v.gameId === game.id) {
          total += v.vote;
        }
      });
      return {
        id: game.id,
        title: game.title,
        total,
        vibe: game.vibe,
        style: game.style,
        category: game.category,
      };
    }).sort((a, b) => b.total - a.total);
  }, [ttrpgs, votes]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Board Game Poll Results</h2>
          <p className="text-muted-foreground text-sm">
            Ranked by total vote score (0 = skip, 1 = interested, 2 = want to play)
          </p>
        </CardHeader>
        <CardContent>
          {boardGamesWithTotal.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boardGamesWithTotal.map((g, i) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      {g.boardGameGeekLink ? (
                        <a
                          href={g.boardGameGeekLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:no-underline"
                        >
                          {g.title}
                        </a>
                      ) : (
                        g.title
                      )}
                    </TableCell>
                    <TableCell>{g.weight ?? "—"}</TableCell>
                    <TableCell>{g.playerCount ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{g.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No board games yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">TTRPG Poll Results</h2>
          <p className="text-muted-foreground text-sm">
            Ranked by total vote score (0 = skip, 1 = interested, 2 = want to play)
          </p>
        </CardHeader>
        <CardContent>
          {ttrpgsWithTotal.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Vibe</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ttrpgsWithTotal.map((g, i) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>{g.title}</TableCell>
                    <TableCell>{g.vibe ?? "—"}</TableCell>
                    <TableCell>{g.style ?? "—"}</TableCell>
                    <TableCell>{g.category ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{g.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No TTRPGs yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
