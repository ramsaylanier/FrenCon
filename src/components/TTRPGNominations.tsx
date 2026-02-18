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

interface Nomination {
  id: string;
  gameName: string;
  description: string;
  nominatedBy: string;
  votes: number;
  createdAt: unknown;
}

interface TTRPGNominationsProps {
  user: AuthUser | null;
}

export default function TTRPGNominations({ user }: TTRPGNominationsProps) {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'ttrpgNominations'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setNominations(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt,
          })) as Nomination[]
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
      await addDoc(collection(db, 'ttrpgNominations'), {
        gameName,
        description,
        nominatedBy: user.email ?? user.uid,
        votes: 0,
        createdAt: serverTimestamp(),
      });
      setGameName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add nomination');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Nominate a TTRPG</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="gameName">Game/System Name</label>
          <input
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            placeholder="e.g. D&D 5e, Blades in the Dark"
          />
        </div>
        <div>
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why do you want to play this?"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Nomination'}
        </button>
      </form>

      <h2>TTRPG Nominations</h2>
      <ul>
        {nominations.map((n) => (
          <li key={n.id}>
            <strong>{n.gameName}</strong>
            {n.description && ` — ${n.description}`}
            <br />
            <small>Nominated by {n.nominatedBy} • Votes: {n.votes ?? 0}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
