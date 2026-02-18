import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { SignInForm } from './SignInForm';

interface ProtectedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedContent({ children, fallback }: ProtectedContentProps) {
  const { user, loading } = useAuth();


  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div>
        <p>Please sign in to access this content.</p>
        <SignInForm />
      </div>
    );
  }

  return <>{children}</>;
}
