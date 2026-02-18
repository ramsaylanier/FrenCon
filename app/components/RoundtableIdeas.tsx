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
import type { AuthUser } from "~/lib/types";

interface Idea {
  id: string;
  topic: string;
  notes: string;
  createdBy: string;
  createdAt: unknown;
}

interface RoundtableIdeasProps {
  user: AuthUser | null;
}

export default function RoundtableIdeas({ user }: RoundtableIdeasProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "roundtableIdeas"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
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
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "roundtableIdeas"), {
        topic,
        notes,
        createdBy: user.email ?? user.uid,
        createdAt: serverTimestamp(),
      });
      setTopic("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add idea");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Add Roundtable Idea</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="e.g. Top Components"
          />
        </div>
        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Idea"}
        </button>
      </form>

      <h2>Roundtable Ideas</h2>
      <ul>
        {ideas.map((i) => (
          <li key={i.id}>
            <strong>{i.topic}</strong>
            {i.notes && (
              <>
                <br />
                <span>{i.notes}</span>
              </>
            )}
            <br />
            <small>By {i.createdBy}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
