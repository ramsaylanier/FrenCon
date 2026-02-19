# Seed Scripts

Import board games, TTRPGs, and user votes from your Google Spreadsheet into Firestore.

**Votes are embedded** in the Board Games and TTRPGs sheets (no separate Votes sheet). User columns: Chris, Greg, Jesse, Ramsay, Ryan, Steve, Tyler.

## User mapping

Fill in `USER_NAME_TO_EMAIL` in `scripts/seed-config.ts` with each user's Firebase email so votes map correctly:

```ts
export const USER_NAME_TO_EMAIL: Record<string, string> = {
  Chris: "chris@example.com",
  Greg: "greg@example.com",
  Jesse: "jesse@example.com",
  Ramsay: "ramsay@example.com",
  Ryan: "ryan@example.com",
  Steve: "steve@example.com",
  Tyler: "tyler@example.com",
};
```

If not set, the script tries to match by Firebase Auth `displayName` (or first name).

## Seed users (display names)

Create Firestore documents in `users/{uid}` with display names from Firebase Auth. Run after users have signed up:

```bash
npm run seed:users           # Dry run
npm run seed:users:write     # Write to Firestore
```

Display name is resolved via `USER_NAME_TO_EMAIL` (email → key is display name), then Auth `displayName`, then email local part, or uid prefix as fallback.

## Option 1: CSV Import (simplest)

1. Export your spreadsheet sheets as CSV:
   - In Google Sheets: **File → Download → Comma Separated Values (.csv)**
   - Export each sheet separately (Board Games, TTRPGs)

2. Place the CSV files in `scripts/data/`:
   - `board-games.csv` — Game Title, BGG Link, Player Count, Weight, Chris, Greg, Jesse, Ramsay, Ryan, Steve, Tyler, ..., Who's Bringin, Teacher
   - `ttrpgs.csv` — (4 instruction rows), then System Title, Vibe, Style, Category, Chris, Greg, ..., GM Signup cols

3. Run:
   ```bash
   npm run seed:csv           # Dry run (preview)
   npm run seed:csv:write     # Write to Firestore
   ```

## Option 2: Google Sheets API (direct)

1. Enable [Google Sheets API](https://console.developers.google.com/apis/api/sheets.googleapis.com) in your Google Cloud project.

2. Share the spreadsheet with your Firebase service account email (`FIREBASE_CLIENT_EMAIL` from `.env`). Give it **Viewer** access.

3. Update `scripts/seed-config.ts` (sheet names, `USER_NAME_TO_EMAIL`) after running:
   ```bash
   npm run seed:discover      # Lists all sheets and previews data
   ```

4. Run:
   ```bash
   npm run seed               # Dry run
   npm run seed:write         # Write to Firestore
   ```

## Column formats

- **Weight**: light, medium, heavy (partial match; "Midweight" → medium)
- **Style**: tactical, story, hybrid
- **Category**: campaign, oneshot
- **Teacher/Owner/GMs**: display name (Chris, Tyler, etc.) — resolved via `USER_NAME_TO_EMAIL` or displayName
- **Vote**: 0 (skip), 1 (interested), 2 (want to play)
