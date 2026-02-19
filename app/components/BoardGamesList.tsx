import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { db } from "~/lib/firebase.client";
import AddBoardGameDialog from "~/components/AddBoardGameDialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DataTable } from "~/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { AuthUser } from "~/lib/types";
import type { BoardGame, GameWeight } from "~/lib/types";

interface BoardGameRow extends BoardGame {
  votesByUser: Record<string, number>;
  total: number;
}

interface UserInfo {
  uid: string;
  displayName: string;
}

const GAME_WEIGHTS: GameWeight[] = ["light", "medium", "heavy"];

export default function BoardGamesList({ user }: { user: AuthUser | null }) {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [votes, setVotes] = useState<Map<string, { userId: string; vote: number }>>(new Map());
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "total", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState({ left: ["title"] as string[], right: ["total"] as string[] });
  const [gameToDelete, setGameToDelete] = useState<BoardGameRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubGames = onSnapshot(
      collection(db, "boardGames"),
      (snapshot) => {
        setGames(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as BoardGame[]
        );
      },
      (err) => setError(err.message)
    );

    const unsubVotes = onSnapshot(
      query(collection(db, "userVotes"), where("gameType", "==", "boardGame")),
      (snapshot) => {
        const map = new Map<string, { userId: string; vote: number }>();
        snapshot.docs.forEach((d) => {
          const data = d.data();
          map.set(d.id, {
            userId: data.userId,
            vote: data.vote ?? 0,
          });
        });
        setVotes(map);
      },
      (err) => setError(err.message)
    );

    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            displayName: (d.data().displayName as string) || d.id.slice(0, 8),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();

    return () => {
      unsubGames();
      unsubVotes();
    };
  }, []);

  const userList = useMemo(() => {
    const all = new Set<string>();
    votes.forEach((v) => all.add(v.userId));
    if (user) all.add(user.uid);
    return Array.from(all);
  }, [votes, user]);

  const userDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.uid, u.displayName));
    userList.forEach((uid) => {
      if (!map.has(uid)) map.set(uid, uid.slice(0, 8));
    });
    return map;
  }, [users, userList]);

  const rows = useMemo<BoardGameRow[]>(() => {
    return games.map((game) => {
      const votesByUser: Record<string, number> = {};
      userList.forEach((uid) => {
        const key = `boardGame_${uid}_${game.id}`;
        const v = votes.get(key);
        votesByUser[uid] = v?.vote ?? 0;
      });
      const total = Object.values(votesByUser).reduce((a, b) => a + b, 0);
      return {
        ...game,
        votesByUser,
        total,
      };
    });
  }, [games, votes, userList]);

  const handleVoteChange = useCallback(
    async (gameId: string, vote: 0 | 1 | 2) => {
      if (!user) return;
      const docId = `boardGame_${user.uid}_${gameId}`;
      await setDoc(
        doc(db, "userVotes", docId),
        { gameType: "boardGame", userId: user.uid, gameId, vote },
        { merge: true }
      );
    },
    [user]
  );

  const handleDelete = useCallback(
    async (game: BoardGameRow) => {
      if (!user || game.owner !== user.uid) return;
      setDeleting(true);
      setError(null);
      try {
        const batch = writeBatch(db);
        // Delete the game; votes are left as orphaned (rules prevent deleting others' votes)
        batch.delete(doc(db, "boardGames", game.id));
        await batch.commit();
        setGameToDelete(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete game");
      } finally {
        setDeleting(false);
      }
    },
    [user]
  );

  const columns = useMemo<ColumnDef<BoardGameRow>[]>(() => {
    const cols: ColumnDef<BoardGameRow>[] = [
      {
        accessorKey: "title",
        header: "Title",
        meta: { stickyWidth: 200 },
        cell: ({ row }) => {
          const searchUrl = `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(row.original.title)}`;
          return (
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {row.original.title}
            </a>
          );
        },
        filterFn: "includesString",
      },
      {
        accessorKey: "weight",
        header: "Weight",
        filterFn: "equals",
      },
      {
        accessorKey: "playerCount",
        header: "Players",
      },
      ...userList.map(
        (uid): ColumnDef<BoardGameRow> => ({
          id: `vote_${uid}`,
          header: userDisplayNames.get(uid) ?? uid.slice(0, 8),
          accessorFn: (row) => row.votesByUser[uid] ?? 0,
          cell: ({ row }) => {
            const gameId = row.original.id;
            const value = (row.original.votesByUser[uid] ?? 0) as 0 | 1 | 2;
            const isCurrentUser = user?.uid === uid;
            const voteBgClass =
              value === 2 ? "bg-green-100" : value === 1 ? "bg-yellow-100" : "bg-red-100";
            const content = isCurrentUser ? (
              <Select
                value={String(value)}
                onValueChange={(v) => handleVoteChange(gameId, Number(v) as 0 | 1 | 2)}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span>{value}</span>
            );
            return <div className={`inline-flex rounded px-2 py-1 ${voteBgClass}`}>{content}</div>;
          },
        })
      ),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const game = row.original;
          const isOwner = user && game.owner === user.uid;
          if (!isOwner) return null;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setGameToDelete(game)}
            >
              Remove
            </Button>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        meta: { stickyWidth: 80 },
        cell: ({ getValue }) => <span className="font-medium">{getValue() as number}</span>,
      },
    ];
    return cols;
  }, [userList, userDisplayNames, user, handleVoteChange, handleDelete]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnPinning },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: (updater) =>
      setColumnPinning((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return { left: next.left ?? [], right: next.right ?? [] };
      }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card className="h-full gap-4 py-4 md:gap-6 md:py-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold">Board Games</h2>
          </div>
          <AddBoardGameDialog user={user} onError={setError} />
        </CardHeader>
        <CardContent className="h-full overflow-scroll px-4 md:px-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Filter by title..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={(table.getColumn("weight")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) =>
                  table.getColumn("weight")?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All weights</SelectItem>
                  {GAME_WEIGHTS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DataTable
              table={table}
              loading={loading}
              emptyMessage="No games yet. Add one above."
              mobilePrimaryColumn="title"
              mobileColumns={["weight", "playerCount"]}
              mobileVoteColumnId={user ? `vote_${user.uid}` : undefined}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove game?</DialogTitle>
            <DialogDescription>
              {gameToDelete
                ? `Remove "${gameToDelete.title}" from the list? This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGameToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => gameToDelete && handleDelete(gameToDelete)}
              disabled={deleting}
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
