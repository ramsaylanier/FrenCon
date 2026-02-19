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

interface MerchIdea {
  id: string;
  item: string;
  description: string;
  suggestedBy: string;
  createdAt: unknown;
}

interface MerchIdeasProps {
  user: AuthUser | null;
}

export default function MerchIdeas({ user }: MerchIdeasProps) {
  const [ideas, setIdeas] = useState<MerchIdea[]>([]);
  const [item, setItem] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "merchIdeas"),
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
          })) as MerchIdea[]
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
      await addDoc(collection(db, "merchIdeas"), {
        item,
        description,
        suggestedBy: user.email ?? user.uid,
        createdAt: serverTimestamp(),
      });
      setItem("");
      setDescription("");
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
          <h2 className="text-lg font-semibold">Suggest Merchandise</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Input
                id="item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                placeholder="e.g. FrenCon t-shirt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details, design ideas, etc."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Suggestion"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Merchandise Ideas</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {ideas.map((i) => (
              <li
                key={i.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <p className="font-medium">{i.item}</p>
                {i.description && (
                  <p className="text-muted-foreground text-sm">{i.description}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  Suggested by {i.suggestedBy}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
