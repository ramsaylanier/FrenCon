import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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

interface AddRoundtableIdeaDialogProps {
  user: AuthUser | null;
  onError?: (message: string | null) => void;
}

export default function AddRoundtableIdeaDialog({
  user,
  onError,
}: AddRoundtableIdeaDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  const resetForm = () => {
    setTopic("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    onError?.(null);
    try {
      await addDoc(collection(db, "roundtableIdeas"), {
        topic,
        notes,
        createdBy: user.email ?? user.uid,
        createdByDisplayName: user.displayName ?? user.email ?? user.uid.slice(0, 8),
        owner: user.uid,
        createdAt: serverTimestamp(),
      });
      resetForm();
      setOpen(false);
      onError?.(null);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to add idea");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!user}>Add Idea</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Roundtable Idea</DialogTitle>
          <DialogDescription>
            Suggest a topic for roundtable discussion. Other attendees can vote
            for ideas they&apos;d like to see.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="e.g. Top Components"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Idea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
