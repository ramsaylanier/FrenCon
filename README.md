# FrenCon 2026

A board game convention website built with React Router, Firebase Auth, and Firestore. Deploys to Vercel.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase configuration

The project is already configured for Firebase project `frencon-2026`. The `.env` file contains the Firebase config. If you need to use a different project:

```bash
firebase use <project-id>
```

Then update `.env` with your Firebase config from the [Firebase Console](https://console.firebase.google.com/). Use `VITE_` prefix for client-side vars (e.g. `VITE_FIREBASE_API_KEY`) and set server vars in `.env` for local dev or Vercel Environment Variables for production.

### 3. Enable Authentication providers

In [Firebase Console](https://console.firebase.google.com/project/frencon-2026/authentication/providers):

- Enable **Email/Password** sign-in
- Enable **Google** sign-in (add support email and OAuth redirect URIs for your domain)

### 4. Create Firestore database

If not already created, in Firebase Console go to Firestore and create a database. Then deploy rules:

```bash
firebase deploy --only firestore
```

### 5. Run locally

```bash
npm run dev
```

Visit http://localhost:5173

### 6. Seed from spreadsheet (optional)

To import board games, TTRPGs, and votes from a Google Spreadsheet:

- **CSV**: Export sheets as CSV, place in `scripts/data/`, run `npm run seed:csv:write`
- **Sheets API**: Enable Sheets API, share sheet with service account, run `npm run seed:write`

See [scripts/README.md](scripts/README.md) for details.

### 7. Deploy (Vercel)

1. Push your code to GitHub and [import the project in Vercel](https://vercel.com/new).
2. Add your Firebase env vars in Vercel: Project Settings → Environment Variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, etc.).
3. Deployments happen automatically on push. Or run `npm run deploy` (requires Vercel CLI: `npm i -g vercel`).

For Firestore rules, use `firebase deploy --only firestore` separately.

## Features

- **Authentication** — Sign in with Email/Password or Google
- **Board Games** — Add board games and vote (0/1/2)
- **Roundtable Ideas** — Suggest discussion topics
- **TTRPGs** — Add TTRPGs and vote (0/1/2)
- **Polling Results** — View vote rankings
- **Merchandise** — Suggest merch ideas
- **Videos** — Add and watch videos (YouTube/Vimeo)
- **Blog** — Markdown blog posts in `app/content/blog/`
- **Profile** — Dietary restrictions and travel preferences

## Adding blog posts

Create `.md` files in `app/content/blog/` with frontmatter:

```md
---
title: Your Post Title
description: Short description
pubDate: 2026-02-18
author: Your Name
---

Your content here...
```
