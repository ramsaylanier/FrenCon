import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { AuthUser } from "~/lib/types";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  publishedAt: unknown;
  createdBy?: string;
}

function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-4">
      {videos.map((v) => (
        <Card key={v.id}>
          <CardHeader>
            <h3 className="font-semibold">{v.title}</h3>
            {v.description && (
              <p className="text-muted-foreground text-sm">{v.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="aspect-video max-w-[560px] overflow-hidden rounded-md">
              <iframe
                src={getEmbedUrl(v.url)}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            {v.createdBy && (
              <p className="text-muted-foreground text-xs">
                Added by {v.createdBy}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface AddVideoFormProps {
  user: AuthUser | null;
}

function AddVideoForm({ user }: AddVideoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "videos"), {
        title,
        description,
        url,
        createdBy: user.email ?? user.uid,
        publishedAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Add Video</h2>
      </CardHeader>
      <CardContent>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Video"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function VideosListInner() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "videos"),
      orderBy("publishedAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVideos(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt,
          })) as Video[]
        );
      },
      (err) => setError(err.message)
    );
    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Videos</h2>
      </CardHeader>
      <CardContent>
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <p className="text-muted-foreground">No videos yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

interface VideosListProps {
  user: AuthUser | null;
}

export default function VideosList({ user }: VideosListProps) {
  return (
    <div className="space-y-6">
      {user ? (
        <AddVideoForm user={user} />
      ) : (
        <p className="text-muted-foreground">Sign in to add videos.</p>
      )}
      <VideosListInner />
    </div>
  );
}
