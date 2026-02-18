import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "~/lib/firebase.client";
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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="dietaryRestrictions">
            Dietary Restrictions & Preferences
          </label>
          <textarea
            id="dietaryRestrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g. Vegetarian, nut allergy, no dairy"
          />
        </div>
        <div>
          <label htmlFor="travelPreferences">Travel Preferences</label>
          <textarea
            id="travelPreferences"
            value={travelPreferences}
            onChange={(e) => setTravelPreferences(e.target.value)}
            placeholder="e.g. Flying in Friday, need ride from airport"
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
