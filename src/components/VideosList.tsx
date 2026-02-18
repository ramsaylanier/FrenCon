import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import type { AuthUser } from '../lib/auth';

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
    <div style={{ display: 'grid', gap: '1rem' }}>
      {videos.map((v) => (
        <div key={v.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>{v.title}</h3>
          {v.description && <p>{v.description}</p>}
          <div style={{ aspectRatio: '16/9', maxWidth: '560px' }}>
            <iframe
              src={getEmbedUrl(v.url)}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          </div>
          {v.createdBy && (
            <small>Added by {v.createdBy}</small>
          )}
        </div>
      ))}
    </div>
  );
}

interface AddVideoFormProps {
  user: AuthUser | null;
}

function AddVideoForm({ user }: AddVideoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, 'videos'), {
        title,
        description,
        url,
        createdBy: user.email ?? user.uid,
        publishedAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Video title"
        />
      </div>
      <div>
        <label htmlFor="url">URL (YouTube or Vimeo)</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Video description"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Video'}
      </button>
    </form>
  );
}

function VideosListInner() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'videos'),
      orderBy('publishedAt', 'desc')
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

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Videos</h2>
      {videos.length > 0 ? (
        <VideoGrid videos={videos} />
      ) : (
        <p>No videos yet.</p>
      )}
    </div>
  );
}

interface VideosListProps {
  user: AuthUser | null;
}

export default function VideosList({ user }: VideosListProps) {
  return (
    <div>
      {user ? (
        <>
          <h2>Add Video</h2>
          <AddVideoForm user={user} />
        </>
      ) : (
        <p>Sign in to add videos.</p>
      )}
      <VideosListInner />
    </div>
  );
}
