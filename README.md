# FrenCon 2026

A board game convention website built with Astro, Firebase Auth, and Firestore.

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

Then update `.env` with your Firebase config from the [Firebase Console](https://console.firebase.google.com/). Use the `PUBLIC_` prefix for all variables (Astro only exposes `PUBLIC_*` to client-side code).

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

Visit http://localhost:4321

### 6. Deploy

```bash
npm run build
firebase deploy --only hosting
```

## Features

- **Authentication** — Sign in with Email/Password or Google
- **Game Nominations** — Nominate board games to play
- **Roundtable Ideas** — Suggest discussion topics
- **TTRPG Polling** — Nominate tabletop RPGs
- **Polling Results** — View vote rankings
- **Merchandise** — Suggest merch ideas
- **Videos** — Add and watch videos (YouTube/Vimeo)
- **Blog** — Markdown blog posts in `src/content/blog/`
- **Profile** — Dietary restrictions and travel preferences

## Adding blog posts

Create `.md` files in `src/content/blog/` with frontmatter:

```md
---
title: Your Post Title
description: Short description
pubDate: 2026-02-18
author: Your Name
---

Your content here...
```
