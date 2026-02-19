import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { db } from "~/lib/firebase.client";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { AuthUser } from "~/lib/types";
import type { TTRPG, TTRPGStyle, TTRPGCategory } from "~/lib/types";

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

  const [title, setTitle] = useState("");
  const [vibe, setVibe] = useState("");
  const [style, setStyle] = useState<TTRPGStyle>("hybrid");
  const [category, setCategory] = useState<TTRPGCategory>("oneshot");
  const [gmsInput, setGmsInput] = useState("");
  const [adding, setAdding] = useState(false);

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

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    setError(null);
    try {
      const gms = gmsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await addDoc(collection(db, "ttrpgs"), {
        title,
        vibe,
        style,
        category,
        gms,
      });
      setTitle("");
      setVibe("");
      setStyle("hybrid");
      setCategory("oneshot");
      setGmsInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add game");
    } finally {
      setAdding(false);
    }
  };

  const columns = useMemo<ColumnDef<TTRPGRow>[]>(() => {
    const cols: ColumnDef<TTRPGRow>[] = [
      {
        accessorKey: "title",
        header: "Title",
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
          return gms?.length ? gms.join(", ") : "—";
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => <span className="font-medium">{getValue() as number}</span>,
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
            if (isCurrentUser) {
              return (
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
              );
            }
            return <span>{value}</span>;
          },
        })
      ),
    ];
    return cols;
  }, [userList, userDisplayNames, user, handleVoteChange]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
        <CardHeader>
          <h2 className="text-lg font-semibold">Add TTRPG</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddGame} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. D&D 5e, Blades in the Dark"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vibe">Vibe</Label>
                <Input
                  id="vibe"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="e.g. Dark fantasy, heist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as TTRPGStyle)}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TTRPG_STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TTRPGCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TTRPG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gms">GMs (user IDs, comma-separated)</Label>
                <Input
                  id="gms"
                  value={gmsInput}
                  onChange={(e) => setGmsInput(e.target.value)}
                  placeholder="e.g. uid1, uid2"
                />
              </div>
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add TTRPG"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">TTRPGs</h2>
          <p className="text-muted-foreground text-sm">
            Vote: 0 = skip, 1 = interested, 2 = want to play. Click column headers to sort.
          </p>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none hover:underline"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No TTRPGs yet. Add one above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
