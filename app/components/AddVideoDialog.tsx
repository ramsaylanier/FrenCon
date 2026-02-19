import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

interface AddVideoDialogProps {
  user: AuthUser | null;
  onError?: (message: string | null) => void;
}

export default function AddVideoDialog({ user, onError }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    onError?.(null);
    try {
      await addDoc(collection(db, "videos"), {
        title,
        description,
        url,
        createdBy: user.email ?? user.uid,
        publishedAt: serverTimestamp(),
      });
      resetForm();
      setOpen(false);
      onError?.(null);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!user}>Add Video</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>
            Add a video to the list. YouTube and Vimeo URLs are supported.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Video title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL (YouTube or Vimeo)</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
