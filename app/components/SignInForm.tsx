import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "~/lib/firebase.client";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    auth.setPersistence(browserLocalPersistence);
  }, []);

  const signInWithToken = async (idToken: string) => {
    const url = new URL("/api/auth/signin", window.location.origin);
    url.searchParams.set(
      "redirect",
      new URLSearchParams(window.location.search).get("redirect") || "/"
    );
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (response.redirected) {
      window.location.assign(response.url);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      await signInWithToken(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      await signInWithToken(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="text-center text-muted-foreground text-sm">or</p>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full"
      >
        Sign in with Google
      </Button>
    </div>
  );
}
