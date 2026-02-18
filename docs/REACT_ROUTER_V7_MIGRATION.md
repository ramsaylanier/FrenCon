# Remix v2 → React Router v7 Migration Plan

## Overview

React Router v7 is the unified framework that merged with Remix. This plan migrates FrenCon from Remix v2 to React Router v7.

**Requirements:** React 18+, Node 20+

**Strategy:** Use the [codemod](https://codemod.com/registry/remix-2-react-router-upgrade) where possible, then manually fix any gaps.

---

## Phase 1: Prepare (Future Flags)

### 1.1 Add Remix v2 Future Flags

Enable all future flags in `vite.config.ts` before migrating. This aligns Remix v2 behavior with React Router v7.

```ts
// vite.config.ts - add to remix() plugin options
remix({
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true,
    v3_routeConfig: true,  // enables routes.ts
  },
})
```

---

## Phase 2: Run Codemod (Automated)

### 2.1 Run the Codemod

```bash
npx codemod remix/2/react-router/upgrade
```

**What it does:**
- Updates package.json (dependencies, scripts)
- Changes imports from `@remix-run/*` to `react-router` / `@react-router/*`
- Updates vite.config.ts (remix → reactRouter plugin)
- Modifies entry files if present
- Updates tsconfig

### 2.2 Install Dependencies

```bash
npm install
```

---

## Phase 3: Manual Steps (If Codemod Skips or Fails)

### 3.1 Package Mapping

| Remix v2 | React Router v7 |
|----------|------------------|
| `@remix-run/node` | `@react-router/node` |
| `@remix-run/react` | `react-router` |
| `@remix-run/serve` | `@react-router/serve` |
| `@remix-run/dev` | `@react-router/dev` |

### 3.2 Script Changes

| Script | Remix v2 | React Router v7 |
|--------|----------|-----------------|
| `dev` | `remix vite:dev` | `react-router dev` |
| `build` | `remix vite:build` | `react-router build` |
| `start` | `remix-serve build/server/index.js` | `react-router-serve build/server/index.js` |
| `typecheck` | `tsc` | `react-router typegen && tsc` |

### 3.3 Add `app/routes.ts`

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

### 3.4 Create `react-router.config.ts`

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
} satisfies Config;
```

### 3.5 Update `vite.config.ts`

```ts
import { reactRouter } from "@react-router/dev/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
```

### 3.6 Update `tsconfig.json`

- `types`: `["@react-router/node", "vite/client"]`
- `include`: add `".react-router/types/**/*"`
- `rootDirs`: `[".", "./.react-router/types"]`

### 3.7 Import Changes

**From `@remix-run/node`:**
```ts
- import { redirect } from "@remix-run/node";
- import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
+ import { redirect } from "react-router";
+ import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "react-router";
```

**From `@remix-run/react`:**
```ts
- import { Link, Form, Outlet, useLoaderData, useRouteLoaderData, Meta, Links, Scripts, ScrollRestoration } from "@remix-run/react";
+ import { Link, Form, Outlet, useLoaderData, useRouteLoaderData, Meta, Links, Scripts, ScrollRestoration } from "react-router";
```

### 3.8 Entry Files (If Custom)

FrenCon uses default entry files. If the codemod creates or you add custom entries:

- `RemixServer` → `ServerRouter` (from `react-router`)
- `RemixBrowser` → `HydratedRouter` (from `react-router/dom`)

### 3.9 Add to `.gitignore`

```
.react-router/
```

---

## Phase 4: Post-Migration

### 4.1 Run Type Generation

```bash
npm run typecheck
# or: npx react-router typegen
```

### 4.2 Verify

- [ ] `npm run dev` starts
- [ ] `npm run build` succeeds
- [ ] `npm start` serves the app
- [ ] Auth flow works (signin, signout, protected routes)
- [ ] Blog loads
- [ ] Firebase components work

---

## File Summary

**Files to create:**
- `app/routes.ts`
- `react-router.config.ts`

**Files to modify:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `.gitignore`
- All files with `@remix-run/*` imports (~20 files)

**No custom entry files** — FrenCon uses Remix defaults, so step 8 from the official guide may not apply.

---

## Rollback

If migration fails, revert with git:
```bash
git checkout -- .
git clean -fd node_modules
npm install
```
