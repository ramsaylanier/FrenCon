import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import AddVideoDialog from "~/components/AddVideoDialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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

interface VideosListProps {
  user: AuthUser | null;
}

export default function VideosList({ user }: VideosListProps) {
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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h2 className="text-lg font-semibold">Videos</h2>
        </div>
        {user &&
          <AddVideoDialog user={user} onError={setError} />
        }
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
