import type { ServiceAccount } from "firebase-admin";
import type { App } from "firebase-admin/app";
import { initializeApp, cert, getApps } from "firebase-admin/app";

let _app: App | null = null;
let _initError: unknown = null;

function getApp(): App | null {
  if (_app) return _app;
  if (_initError) return null;

  try {
    const existing = getApps();
    if (existing.length > 0) return existing[0];

    const hasCreds =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY;

    if (hasCreds) {
      const serviceAccount = {
        type: "service_account" as const,
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        authProviderX509CertUrl: process.env.FIREBASE_AUTH_CERT_URL,
        clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
      } as ServiceAccount;
      _app = initializeApp({ credential: cert(serviceAccount) });
    } else {
      _app = initializeApp();
    }
    return _app;
  } catch (err) {
    _initError = err;
    console.error("[firebase.server] Init failed:", err);
    return null;
  }
}

export const app = getApp();
export { getApp };
