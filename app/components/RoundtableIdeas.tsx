import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
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
import AddRoundtableIdeaDialog from "~/components/AddRoundtableIdeaDialog";
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

interface Idea {
  id: string;
  topic: string;
  notes: string;
  createdBy: string;
  createdByDisplayName?: string;
  owner?: string;
  createdAt: unknown;
}

interface IdeaRow extends Idea {
  votesByUser: Record<string, number>;
  total: number;
}

interface UserInfo {
  uid: string;
  displayName: string;
}

export default function RoundtableIdeas({ user }: { user: AuthUser | null }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votes, setVotes] = useState<
    Map<string, { userId: string; vote: number }>
  >(new Map());
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "total", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState({ left: [] as string[], right: ["total"] as string[] });
  const [ideaToDelete, setIdeaToDelete] = useState<IdeaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubIdeas = onSnapshot(
      query(
        collection(db, "roundtableIdeas"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setIdeas(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt,
          })) as Idea[]
        );
      },
      (err) => setError(err.message)
    );

    const unsubVotes = onSnapshot(
      query(
        collection(db, "userVotes"),
        where("gameType", "==", "roundtableIdea")
      ),
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
      unsubIdeas();
      unsubVotes();
    };
  }, []);

  const userList = useMemo(() => {
    const all = new Set<string>();
    users.forEach((u) => all.add(u.uid));
    if (user) all.add(user.uid);
    return Array.from(all);
  }, [users, user]);

  const userDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.uid, u.displayName));
    userList.forEach((uid) => {
      if (!map.has(uid)) map.set(uid, uid.slice(0, 8));
    });
    return map;
  }, [users, userList]);

  const rows = useMemo<IdeaRow[]>(() => {
    return ideas.map((idea) => {
      const votesByUser: Record<string, number> = {};
      userList.forEach((uid) => {
        const key = `roundtableIdea_${uid}_${idea.id}`;
        const v = votes.get(key);
        votesByUser[uid] = v?.vote ?? 0;
      });
      const total = Object.values(votesByUser).reduce((a, b) => a + b, 0);
      return {
        ...idea,
        votesByUser,
        total,
      };
    });
  }, [ideas, votes, userList]);

  const handleVoteChange = useCallback(
    async (ideaId: string, vote: 0 | 1 | 2) => {
      if (!user) return;
      const docId = `roundtableIdea_${user.uid}_${ideaId}`;
      await setDoc(
        doc(db, "userVotes", docId),
        {
          gameType: "roundtableIdea",
          userId: user.uid,
          gameId: ideaId,
          vote,
        },
        { merge: true }
      );
    },
    [user]
  );

  const isOwnIdea = useCallback(
    (idea: IdeaRow) =>
      !!user &&
      (idea.owner === user.uid ||
        idea.createdBy === user.uid ||
        idea.createdBy === user.email),
    [user]
  );

  const handleDelete = useCallback(
    async (idea: IdeaRow) => {
      if (!user || !isOwnIdea(idea)) return;
      setDeleting(true);
      setError(null);
      try {
        await deleteDoc(doc(db, "roundtableIdeas", idea.id));
        setIdeaToDelete(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove idea");
      } finally {
        setDeleting(false);
      }
    },
    [user, isOwnIdea]
  );

  const columns = useMemo<ColumnDef<IdeaRow>[]>(() => {
    const cols: ColumnDef<IdeaRow>[] = [
      {
        accessorKey: "topic",
        header: "Topic",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.topic}</span>
        ),
        filterFn: "includesString",
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <div className="max-w-[200px] break-words whitespace-normal text-muted-foreground text-sm">
            {row.original.notes || "—"}
          </div>
        ),
        filterFn: "includesString",
      },
      {
        accessorKey: "createdBy",
        header: "Suggested by",
        cell: ({ row }) => {
          const idea = row.original;
          const displayName =
            idea.createdByDisplayName ??
            userDisplayNames.get(idea.owner ?? "") ??
            userDisplayNames.get(idea.createdBy) ??
            idea.createdBy;
          return <span>{displayName}</span>;
        },
      },
      ...userList.map(
        (uid): ColumnDef<IdeaRow> => ({
          id: `vote_${uid}`,
          header: userDisplayNames.get(uid) ?? uid.slice(0, 8),
          accessorFn: (row) => row.votesByUser[uid] ?? 0,
          cell: ({ row }) => {
            const ideaId = row.original.id;
            const value = (row.original.votesByUser[uid] ?? 0) as 0 | 1 | 2;
            const isCurrentUser = user?.uid === uid;
            const voteBgClass =
              value === 2
                ? "bg-green-100"
                : value === 1
                  ? "bg-yellow-100"
                  : "bg-red-100";
            const content = isCurrentUser ? (
              <Select
                value={String(value)}
                onValueChange={(v) =>
                  handleVoteChange(ideaId, Number(v) as 0 | 1 | 2)
                }
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
            return (
              <div
                className={`inline-flex rounded px-2 py-1 ${voteBgClass}`}
              >
                {content}
              </div>
            );
          },
        })
      ),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const idea = row.original;
          if (!isOwnIdea(idea)) return null;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setIdeaToDelete(idea)}
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
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as number}</span>
        ),
      },
    ];
    return cols;
  }, [userList, userDisplayNames, user, handleVoteChange, isOwnIdea]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, columnPinning },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: (updater) =>
      setColumnPinning((prev) => {
        const next = typeof updater === "function" ? updater(prev) : prev;
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
    <Card className="h-full gap-4 py-4 md:gap-6 md:py-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 md:px-6">
        <div>
          <h2 className="text-lg font-semibold">Roundtable Ideas</h2>
        </div>
        <AddRoundtableIdeaDialog user={user} onError={setError} />
      </CardHeader>
      <CardContent className="h-full overflow-scroll px-4 md:px-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Filter by topic..."
              value={(table.getColumn("topic")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("topic")?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <DataTable
            table={table}
            loading={loading}
            emptyMessage="No ideas yet. Add one above."
            mobilePrimaryColumn="topic"
            mobileColumns={["notes", "createdBy"]}
            mobileVoteColumnId={user ? `vote_${user.uid}` : undefined}
          />
        </div>
      </CardContent>
      <Dialog
        open={!!ideaToDelete}
        onOpenChange={(open) => !open && setIdeaToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove idea?</DialogTitle>
            <DialogDescription>
              {ideaToDelete
                ? `Remove "${ideaToDelete.topic}" from the list? This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIdeaToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => ideaToDelete && handleDelete(ideaToDelete)}
              disabled={deleting}
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
