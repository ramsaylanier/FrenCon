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
          <h2 className="text-lg font-semibold">Add Roundtable Idea</h2>
        </CardHeader>
        <CardContent>
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
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Idea"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Roundtable Ideas</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {ideas.map((i) => (
              <li
                key={i.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <p className="font-medium">{i.topic}</p>
                {i.notes && (
                  <p className="text-muted-foreground text-sm">{i.notes}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  By {i.createdBy}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
