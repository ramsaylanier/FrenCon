import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
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

interface UserProfile {
  displayName: string;
  dietaryRestrictions: string;
  travelPreferences: string;
}

interface ProfileFormProps {
  user: AuthUser | null;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [travelPreferences, setTravelPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(profileRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          setDisplayName(data.displayName ?? "");
          setDietaryRestrictions(data.dietaryRestrictions ?? "");
          setTravelPreferences(data.travelPreferences ?? "");
        } else {
          setDisplayName(user.displayName ?? "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName,
          dietaryRestrictions,
          travelPreferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Your Profile</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietaryRestrictions">
              Dietary Restrictions & Preferences
            </Label>
            <Textarea
              id="dietaryRestrictions"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g. Vegetarian, nut allergy, no dairy"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelPreferences">Travel Preferences</Label>
            <Textarea
              id="travelPreferences"
              value={travelPreferences}
              onChange={(e) => setTravelPreferences(e.target.value)}
              placeholder="e.g. Flying in Friday, need ride from airport"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
