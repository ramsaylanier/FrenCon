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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import TTRPGFormDialog from "~/components/TTRPGFormDialog";
import { cn } from "~/lib/utils";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { AuthUser } from "~/lib/types";
import type { TTRPG, TTRPGStyle, TTRPGCategory } from "~/lib/types";

function voteCellClass(value: 0 | 1 | 2): string {
  switch (value) {
    case 2:
      return "bg-green-500/15 text-green-800 dark:bg-green-500/20 dark:text-green-200";
    case 1:
      return "bg-yellow-500/15 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200";
    case 0:
    default:
      return "bg-red-500/15 text-red-800 dark:bg-red-500/20 dark:text-red-200";
  }
}

interface TTRPGRow extends TTRPG {
  votesByUser: Record<string, number>;
  total: number;
}

interface UserInfo {
  uid: string;
  displayName: string;
}

const TTRPG_STYLES: TTRPGStyle[] = ["tactical", "story", "hybrid"];
const TTRPG_CATEGORIES: TTRPGCategory[] = ["campaign", "oneshot"];

export default function TTRPGList({ user }: { user: AuthUser | null }) {
  const [ttrpgs, setTtrpgs] = useState<TTRPG[]>([]);
  const [votes, setVotes] = useState<Map<string, { userId: string; vote: number }>>(new Map());
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "total", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState({ left: ["title"] as string[], right: ["total"] as string[] });
  const [ttrpgToDelete, setTtrpgToDelete] = useState<TTRPGRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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
      query(collection(db, "userVotes"), where("gameType", "==", "ttrpg")),
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
      unsubTtrpgs();
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

  const rows = useMemo<TTRPGRow[]>(() => {
    return ttrpgs.map((game) => {
      const votesByUser: Record<string, number> = {};
      userList.forEach((uid) => {
        const key = `ttrpg_${uid}_${game.id}`;
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
  }, [ttrpgs, votes, userList]);

  const handleVoteChange = useCallback(
    async (gameId: string, vote: 0 | 1 | 2) => {
      if (!user) return;
      const docId = `ttrpg_${user.uid}_${gameId}`;
      await setDoc(
        doc(db, "userVotes", docId),
        { gameType: "ttrpg", userId: user.uid, gameId, vote },
        { merge: true }
      );
    },
    [user]
  );

  const handleDelete = useCallback(
    async (game: TTRPGRow) => {
      if (!user || game.owner !== user.uid) return;
      setDeleting(true);
      setError(null);
      try {
        const batch = writeBatch(db);
        // Delete the TTRPG; votes are left as orphaned (rules prevent deleting others' votes)
        batch.delete(doc(db, "ttrpgs", game.id));
        await batch.commit();
        setTtrpgToDelete(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete TTRPG");
      } finally {
        setDeleting(false);
      }
    },
    [user]
  );

  const columns = useMemo<ColumnDef<TTRPGRow>[]>(() => {
    const cols: ColumnDef<TTRPGRow>[] = [
      {
        accessorKey: "title",
        header: "Title",
        meta: { stickyWidth: 200 },
        filterFn: "includesString",
      },
      {
        accessorKey: "vibe",
        header: "Vibe",
        filterFn: "includesString",
      },
      {
        accessorKey: "style",
        header: "Style",
        filterFn: "equals",
      },
      {
        accessorKey: "category",
        header: "Category",
        filterFn: "equals",
      },
      {
        accessorKey: "gms",
        header: "GMs",
        cell: ({ getValue }) => {
          const gms = getValue() as string[] | undefined;
          if (!gms?.length) return "—";
          return gms
            .map((uid) => userDisplayNames.get(uid) ?? uid.slice(0, 8))
            .join(", ");
        },
      },
      ...userList.map(
        (uid): ColumnDef<TTRPGRow> => ({
          id: `vote_${uid}`,
          header: userDisplayNames.get(uid) ?? uid.slice(0, 8),
          accessorFn: (row) => row.votesByUser[uid] ?? 0,
          cell: ({ row }) => {
            const gameId = row.original.id;
            const value = (row.original.votesByUser[uid] ?? 0) as 0 | 1 | 2;
            const isCurrentUser = user?.uid === uid;
            const cellClass = cn("inline-flex items-center justify-center rounded px-2 py-0.5 min-w-[2rem]", voteCellClass(value));
            if (isCurrentUser) {
              return (
                <Select
                  value={String(value)}
                  onValueChange={(v) => handleVoteChange(gameId, Number(v) as 0 | 1 | 2)}
                >
                  <SelectTrigger className={cn("h-8 w-16", voteCellClass(value))}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              );
            }
            return <span className={cellClass}>{value}</span>;
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
              onClick={() => setTtrpgToDelete(game)}
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <h2 className="text-lg font-semibold">TTRPGs</h2>
            <p className="text-muted-foreground text-sm">
              Vote: 0 = skip, 1 = interested, 2 = want to play. Click column headers to sort.
            </p>
          </div>
          <TTRPGFormDialog user={user} onError={setError} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Filter by title..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                className="max-w-sm"
              />
              <Input
                placeholder="Filter by vibe..."
                value={(table.getColumn("vibe")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("vibe")?.setFilterValue(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={(table.getColumn("style")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) =>
                  table.getColumn("style")?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All styles</SelectItem>
                  {TTRPG_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={(table.getColumn("category")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) =>
                  table.getColumn("category")?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {TTRPG_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DataTable
              table={table}
              loading={loading}
              emptyMessage="No TTRPGs yet. Add one using the button above."
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!ttrpgToDelete} onOpenChange={(open) => !open && setTtrpgToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove TTRPG?</DialogTitle>
            <DialogDescription>
              {ttrpgToDelete
                ? `Remove "${ttrpgToDelete.title}" from the list? This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTtrpgToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => ttrpgToDelete && handleDelete(ttrpgToDelete)}
              disabled={deleting}
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
