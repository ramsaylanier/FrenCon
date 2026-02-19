/**
 * Create/update Firestore user documents with display names from Firebase Auth.
 *
 * For each Firebase Auth user, creates or merges a document in users/{uid} with:
 *   - displayName (from Auth displayName, or email local part, or uid prefix)
 *
 * Run:
 *   npm run seed:users           # Dry run (preview)
 *   npm run seed:users:write     # Write to Firestore
 */

import "dotenv/config";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin";
import { USER_NAME_TO_EMAIL } from "./seed-config";

// Invert USER_NAME_TO_EMAIL: email -> display name (key is display name)
const emailToDisplayName = Object.fromEntries(
  Object.entries(USER_NAME_TO_EMAIL).map(([name, email]) => [email.toLowerCase(), name])
);

const serviceAccount: ServiceAccount = {
  type: "service_account",
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: process.env.FIREBASE_AUTH_URI,
  tokenUri: process.env.FIREBASE_TOKEN_URI,
  authProviderX509CertUrl: process.env.FIREBASE_AUTH_CERT_URL,
  clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore("frencon-db");
const auth = getAuth();

function deriveDisplayName(
  authDisplayName: string | null | undefined,
  email: string | null | undefined
): string {
  // USER_NAME_TO_EMAIL: key is display name (Chris, Greg, etc.)
  if (email) {
    const name = emailToDisplayName[email.toLowerCase()];
    if (name?.trim()) return name.trim();
  }
  if (authDisplayName?.trim()) return authDisplayName.trim();
  if (email) {
    const local = email.split("@")[0];
    if (local) return local;
  }
  return "";
}

async function seedUsers(write: boolean) {
  let nextPageToken: string | undefined;
  let count = 0;

  do {
    const list = await auth.listUsers(1000, nextPageToken);

    for (const u of list.users) {
      const displayName = deriveDisplayName(u.displayName, u.email);
      const doc = {
        displayName: displayName || u.uid.slice(0, 8),
      };

      if (write) {
        await db.collection("users").doc(u.uid).set(doc, { merge: true });
        console.log(`  ${u.uid}: ${doc.displayName}`);
      } else {
        console.log(`  [dry] ${u.uid}: ${doc.displayName}`);
      }
      count++;
    }

    nextPageToken = list.pageToken;
  } while (nextPageToken);

  console.log(`\n${write ? "Updated" : "Would update"} ${count} user(s) in Firestore.`);
}

async function main() {
  const write = process.argv.includes("--write");

  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY. Load .env");
    process.exit(1);
  }

  await seedUsers(write);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
