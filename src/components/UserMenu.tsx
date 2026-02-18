import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { useAuth } from './AuthProvider';

export function UserMenu() {
  const { user, loading } = useAuth();

  const handleSignOut = () => {
    const auth = getFirebaseAuth();
    signOut(auth);
  };

  if (loading || !user) return null;

  return (
    <span>
      {user.email ?? user.displayName ?? 'User'}
      <button type="button" onClick={handleSignOut}>
        Sign Out
      </button>
    </span>
  );
}
