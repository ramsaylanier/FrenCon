import { useState, useMemo, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { useUsers } from "~/hooks/useUsers";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { AuthUser } from "~/lib/types";
import type { TTRPGStyle, TTRPGCategory } from "~/lib/types";

const TTRPG_STYLES: TTRPGStyle[] = ["tactical", "story", "hybrid"];
const TTRPG_CATEGORIES: TTRPGCategory[] = ["campaign", "oneshot"];

interface TTRPGFormDialogProps {
  user: AuthUser | null;
  onError?: (message: string | null) => void;
  onSuccess?: () => void;
}

export default function TTRPGFormDialog({ user, onError, onSuccess }: TTRPGFormDialogProps) {
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
  const [vibe, setVibe] = useState("");
  const [style, setStyle] = useState<TTRPGStyle>("hybrid");
  const [category, setCategory] = useState<TTRPGCategory>("oneshot");
  const [gms, setGms] = useState<string[]>([]);
  const [owner, setOwner] = useState(user?.uid ?? "");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user?.uid && !owner) setOwner(user.uid);
  }, [user?.uid, owner]);

  const toggleGm = (uid: string) => {
    setGms((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    onError?.(null);
    try {
      await addDoc(collection(db, "ttrpgs"), {
        title,
        vibe,
        style,
        category,
        gms,
        owner: owner || user.uid,
      });
      setTitle("");
      setVibe("");
      setStyle("hybrid");
      setCategory("oneshot");
      setGms([]);
      setOwner(user.uid);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to add game");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add TTRPG</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add TTRPG</DialogTitle>
          <DialogDescription>
            Add a new TTRPG to the list. Others can vote for games they want to play.
          </DialogDescription>
        </DialogHeader>
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
            <div className="space-y-2">
              <Label>GMs</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {gms.length === 0
                      ? "Select GMs who can run"
                      : gms
                          .map((uid) => users.find((u) => u.uid === uid)?.displayName ?? uid.slice(0, 8))
                          .join(", ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[12rem]">
                  {users.map((u) => (
                    <DropdownMenuCheckboxItem
                      key={u.uid}
                      checked={gms.includes(u.uid)}
                      onCheckedChange={() => toggleGm(u.uid)}
                    >
                      {u.displayName}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
          <Button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add TTRPG"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
