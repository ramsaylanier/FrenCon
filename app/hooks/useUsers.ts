import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebase.client";

export interface UserInfo {
  uid: string;
  displayName: string;
}

export function useUsers(): UserInfo[] {
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            displayName: (d.data().displayName as string) || d.id.slice(0, 8),
          }))
        );
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  return users;
}
