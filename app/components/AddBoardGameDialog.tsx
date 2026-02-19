import { useState, useEffect, useMemo } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { useUsers } from "~/hooks/useUsers";
import { Button } from "~/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { AuthUser } from "~/lib/types";
import type { GameWeight } from "~/lib/types";

const GAME_WEIGHTS: GameWeight[] = ["light", "medium", "heavy"];
const TEACHER_NONE = "__none__";

interface AddBoardGameDialogProps {
  user: AuthUser | null;
  onError?: (message: string | null) => void;
}

export default function AddBoardGameDialog({ user, onError }: AddBoardGameDialogProps) {
  const usersFromDb = useUsers();
  const users = useMemo(() => {
    const list = [...usersFromDb];
    if (user?.uid && !list.some((u) => u.uid === user.uid)) {
      list.unshift({
        uid: user.uid,
        displayName: user.displayName ?? user.email ?? user.uid.slice(0, 8),
      });
    }
    return list;
  }, [usersFromDb, user]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [boardGameGeekLink, setBoardGameGeekLink] = useState("");
  const [weight, setWeight] = useState<GameWeight>("medium");
  const [playerCount, setPlayerCount] = useState("");
  const [teacher, setTeacher] = useState(TEACHER_NONE);
  const [owner, setOwner] = useState(user?.uid ?? "");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user?.uid && !owner) setOwner(user.uid);
  }, [user?.uid, owner]);

  const resetForm = () => {
    setTitle("");
    setBoardGameGeekLink("");
    setWeight("medium");
    setPlayerCount("");
    setTeacher(TEACHER_NONE);
    setOwner(user?.uid ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    onError?.(null);
    try {
      await addDoc(collection(db, "boardGames"), {
        title,
        boardGameGeekLink: boardGameGeekLink || "",
        weight,
        playerCount,
        teacher: teacher === TEACHER_NONE ? "" : teacher,
        owner,
      });
      resetForm();
      setOpen(false);
      onError?.(null);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to add game");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!user}>Add Board Game</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Board Game</DialogTitle>
          <DialogDescription>
            Add a board game to the list. Other attendees can vote for games they&apos;d like to play.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Catan"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bgg">Board Game Geek Link</Label>
              <Input
                id="bgg"
                type="url"
                value={boardGameGeekLink}
                onChange={(e) => setBoardGameGeekLink(e.target.value)}
                placeholder="https://boardgamegeek.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Select value={weight} onValueChange={(v) => setWeight(v as GameWeight)}>
                <SelectTrigger id="weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAME_WEIGHTS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerCount">Player Count</Label>
              <Input
                id="playerCount"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                placeholder="e.g. 2-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select value={teacher} onValueChange={setTeacher}>
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="User who can teach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TEACHER_NONE}>None</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.uid} value={u.uid}>
                      {u.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="User who owns the game" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.uid} value={u.uid}>
                      {u.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
