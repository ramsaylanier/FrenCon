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
import { useAuth } from './AuthProvider';
import { ProtectedContent } from './ProtectedContent';

interface MerchIdea {
  id: string;
  item: string;
  description: string;
  suggestedBy: string;
  createdAt: unknown;
}

function MerchIdeasInner() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<MerchIdea[]>([]);
  const [item, setItem] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'merchIdeas'),
      orderBy('createdAt', 'desc')
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
      const db = getFirebaseDb();
      await addDoc(collection(db, 'merchIdeas'), {
        item,
        description,
        suggestedBy: user.email ?? user.uid,
        createdAt: serverTimestamp(),
      });
      setItem('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add idea');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Suggest Merchandise</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="item">Item</label>
          <input
            id="item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
            placeholder="e.g. FrenCon t-shirt"
          />
        </div>
        <div>
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, design ideas, etc."
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Suggestion'}
        </button>
      </form>

      <h2>Merchandise Ideas</h2>
      <ul>
        {ideas.map((i) => (
          <li key={i.id}>
            <strong>{i.item}</strong>
            {i.description && (
              <>
                <br />
                <span>{i.description}</span>
              </>
            )}
            <br />
            <small>Suggested by {i.suggestedBy}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MerchIdeas() {
  return (
    <ProtectedContent>
      <MerchIdeasInner />
    </ProtectedContent>
  );
}
