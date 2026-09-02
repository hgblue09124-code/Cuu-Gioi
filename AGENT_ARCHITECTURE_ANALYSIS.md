# CỬU GIỚI — ARCHITECTURE ANALYSIS REPORT

**Project**: Cửu Giới (Nine Realms)
**Analysis Date**: 2026-09-02
**Analyst**: nanobot (MiniMax-M3)
**Source Verified**: ✅ Code inspection + Build artifacts
**Note**: Audit report (CUU_GIOI_AUDIT.md) used only as cross-reference, not primary source.

---

## TABLE OF CONTENTS

1. [Actual Architecture](#1-actual-architecture)
2. [Data Flow](#2-data-flow)
3. [Active Modules](#3-active-modules)
4. [Placeholder / Unwired Modules](#4-placeholder--unwired-modules)
5. [Missing Pieces for Production](#5-missing-pieces-for-production)
6. [Top 5 Technical Bottlenecks (P0/P1/P2)](#6-top-5-technical-bottlenecks)
7. [Recommended Completion Order](#7-recommended-completion-order)

---

## 1. ACTUAL ARCHITECTURE

### 1.1 Repository Layout (Verified)

```
Cuu-Gioi/
├── artifacts/
│   ├── api-server/              # Express API server (esbuild bundle)
│   ├── cuu-gioi/                # Main game package
│   │   ├── index.html           # ENTRY POINT — vanilla JS game runs here
│   │   ├── css/system.css
│   │   ├── js/                  # 8 vanilla JS modules loaded via <script>
│   │   └── src/                 # React app (UNUSED — placeholder)
│   └── mockup-sandbox/          # Component preview tool (unrelated to game)
├── lib/
│   ├── api-client-react/        # React Query API client
│   ├── api-spec/                # OpenAPI 3.1 spec
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle ORM (EMPTY schema)
├── scripts/
├── package.json
├── pnpm-workspace.yaml          # monorepo + catalog system
└── tsconfig.base.json
```

Note: `lib/integrations/*` listed in pnpm-workspace.yaml does **not exist** on disk.

### 1.2 Monorepo Configuration (Verified)

`pnpm-workspace.yaml` defines four workspace globs:
- `artifacts/*`
- `lib/*`
- `lib/integrations/*` (MISSING)
- `scripts`

Catalog system pins versions for React 19.1.0, Vite 7.3.2, Tailwind 4.1.14, drizzle-orm 0.45.2, zod 3.25.76, and others.

### 1.3 Technology Stack (Verified)

| Layer | Technology | Verified From |
|-------|------------|---------------|
| Game UI | Vanilla JS (script tags, no bundler) | `artifacts/cuu-gioi/index.html` |
| Game State | IndexedDB + localStorage | `artifacts/cuu-gioi/js/state.js` |
| React Shell | React 19 + Wouter + TanStack Query | `artifacts/cuu-gioi/src/App.tsx` |
| UI Library | Radix UI (50+ components) | `artifacts/cuu-gioi/src/components/ui/` |
| CSS | Tailwind 4.1.14 | `artifacts/cuu-gioi/vite.config.ts` |
| Frontend Build | Vite 7.3 | `artifacts/cuu-gioi/package.json` |
| Backend | Express 5.2 + pino-http | `artifacts/api-server/src/app.ts` |
| API Logging | pino 9.14 + pino-pretty | `artifacts/api-server/src/lib/logger.ts` |
| Backend Build | esbuild 0.27.3 | `artifacts/api-server/build.mjs` |
| ORM | Drizzle ORM 0.45.2 + pg | `lib/db/src/index.ts` |
| DB Driver | pg 8.22 (node-postgres) | `lib/db/package.json` |
| Validation | Zod 3.25.76 | `lib/api-zod/src/generated/api.ts` |
| API Codegen | Orval 8.5.3 | `lib/api-spec/orval.config.ts` |
| API Spec | OpenAPI 3.1 | `lib/api-spec/openapi.yaml` |
| Auth | None | (absent from code) |
| Tests | None | (no test files) |

### 1.4 Entry Points (Verified)

| Entry | File | Status |
|-------|------|--------|
| Game (Primary) | `artifacts/cuu-gioi/index.html` | ACTIVE — loads 8 vanilla JS modules |
| Game (React) | `artifacts/cuu-gioi/src/main.tsx` | UNUSED — Vite builds it but `index.html` does not mount React |
| API Server | `artifacts/api-server/src/index.ts` | ACTIVE — single `/api/healthz` endpoint |
| API Spec | `lib/api-spec/openapi.yaml` | ACTIVE — codegen source |

### 1.5 Two-Coexistence Pattern

The most distinctive architectural pattern is **dual-frontend coexistence**:
- A fully functional vanilla JS game in `index.html` + `js/`
- A React scaffold in `src/` with 50+ Radix components, ready to mount but disconnected

Vite's `vite.config.ts` builds React, but `index.html` does not import any React module — only the `<script src="js/*.js">` tags. The `postbuild` script copies `js/` to `dist/public/`, confirming the vanilla JS pipeline is the production runtime.

---

## 2. DATA FLOW

### 2.1 Vanilla JS Game Flow (Active)

```
User Action (button click)
    ↓
inline onclick="functionName()" (defined in index.html)
    ↓
Module function (e.g., cultivate() in core.js)
    ↓
Mutate global `player` object (declared in state.js)
    ↓
autoSave() — debounced 250ms via setTimeout
    ↓
saveToDatabase() — structuredClone(player) → IndexedDB (objectStore: "gameState")
    ↓
render() — full DOM re-render via innerHTML manipulation
    ↓
DOM update
```

### 2.2 Module Load Order (Verified in index.html)

```
1. js/state.js    → GAME, WORLD, REALMS, ENEMIES, QUESTS, EXPLORE_EVENTS, createNewPlayer(), IndexedDB setup
2. js/ui.js       → log(), toast(), showPopup(), render(), escapeHTML(), renderStoryModal()
3. js/inventory.js → ITEMS, useItem(), renderInventory()
4. js/admin.js    → toggleAdminPanel(), adminFullHeal(), adminAddItems(), renderAdmin()
5. js/story.js    → STORY_DATABASE (bell_at_night, old_temple), StoryEngine
6. js/fate.js     → FATE_MESSAGES, consultFate()
7. js/runtime.js  → Runtime Object + Pre-Runtime patches execute immediately
8. js/core.js     → bootGame() — loads player from IndexedDB, applies Runtime patches, calls render()
```

`bootGame()` in `core.js` is the orchestration point. It runs last so all module APIs exist when called.

### 2.3 Runtime Console Patch Flow (Two-Layer System)

```
LocalStorage: CuuGioi_PreRuntimeModules
    ↓ (loaded at runtime.js parse time)
Preruntime bucket — executes IMMEDIATELY before bootGame()
    ↓
LocalStorage: CuuGioi_RuntimeModules
    ↓ (loaded at runtime.js parse time, but execution deferred)
Persistent bucket — executeAll() called by core.js applyRuntimePatches()
    ↓
AFTER player is loaded from IndexedDB → patches mutate player safely
```

This two-layer design solves a bug where Runtime patches touching `player` ran on a temporary default player and were overwritten by `bootGame()` reassigning `player` from IndexedDB.

### 2.4 Frontend → Backend Flow (NONE)

There is **no live communication** between the game frontend and the API server:
- `artifacts/cuu-gioi/index.html` does not import or use any API client.
- `artifacts/cuu-gioi/js/*.js` contain no `fetch()` calls.
- `api-client-react` is declared as a dependency in `cuu-gioi/package.json` but never imported.
- The only generated React Query hook (`useHealthCheck`) is unused.

The two systems are parallel and unconnected.

### 2.5 Save/Load Flow

```
saveGame() → saveToDatabase() → IndexedDB.put("player")
loadGame() → loadFromDatabase() → IndexedDB.get("player") → normalizePlayer() → assign to global `player`
exportSave() → JSON.stringify(player) → download via blob
importSave() → file input → JSON.parse → normalizePlayer() → assign
deleteSave() → IndexedDB.delete("player")
```

---

## 3. ACTIVE MODULES

### 3.1 Game Engine — Vanilla JS (90% complete)

| Module | File | Status |
|--------|------|--------|
| Player State | `js/state.js` | ✅ IndexedDB persistence, normalizePlayer migration |
| Cultivation | `js/core.js:cultivate` | ✅ 5 realms, breakthrough popup |
| Combat | `js/core.js:startCombat, playerAttack, enemyAttack` | ✅ Full loop with win/flee/death handling |
| Travel | `js/core.js:travel, renderTravel` | ✅ 3 locations (thanh_van_tran, son, rung) |
| Explore | `js/core.js:explore` | ✅ Event-driven with popup summary |
| Quest | `js/core.js:updateQuest` | ✅ 1 quest (first_step), 3-goal tracking |
| Inventory | `js/inventory.js` | ✅ 3 items, usable/unequipable distinction |
| Story | `js/story.js` | ✅ 2 nodes, flag system, item/cultivation/gold effects |
| Fate | `js/fate.js` | ✅ 5 messages, random selection |
| NPC | `js/core.js:talkToAnhTuyet` | ✅ Ánh Tuyết dialogue |
| Save/Load | `js/state.js` | ✅ IndexedDB + JSON export/import |
| UI Render | `js/ui.js` | ✅ Full DOM re-render, progress bar |

### 3.2 Runtime Console (APE) v0.2 (Verified)

| Feature | Status |
|---------|--------|
| Module registry (register/get/run/list) | ✅ Working |
| Preruntime bucket (pre-load execution) | ✅ Working |
| Persistent bucket (post-load execution) | ✅ Working |
| localStorage persistence | ✅ Working |
| Admin overlay UI | ✅ Working |
| Patch list with Run/Delete actions | ✅ Working |

### 3.3 Admin Panel v0.4.3 (Verified)

| Feature | Status |
|---------|--------|
| Toggle via toggleAdminPanel() | ✅ Working |
| Quick actions (heal, add items, set stats) | ✅ Working |
| Story test trigger | ✅ Working |
| Explore event injection (saves as Pre-Runtime patch) | ✅ Working |
| Runtime Console link | ✅ Working |

### 3.4 Build System (Verified)

- `pnpm run typecheck` → passes for all 4 packages (cuu-gioi, api-server, mockup-sandbox, scripts)
- `pnpm run build` → Vite builds React shell + `postbuild` copies `js/` to `dist/public/`
- `pnpm --filter @workspace/api-server run build` → esbuild bundles to `dist/index.mjs`
- esbuild config externalizes native modules (pg, sharp, better-sqlite3, etc.)

### 3.5 API Infrastructure (Verified)

- Express 5 app with CORS, JSON parsing, pino-http logging
- `/api/healthz` returns validated `{ status: "ok" }` via Zod schema
- OpenAPI spec with 1 endpoint
- Orval generates React Query hooks and Zod schemas from spec

---

## 4. PLACEHOLDER / UNWIRED MODULES

### 4.1 React App — Placeholder

`artifacts/cuu-gioi/src/App.tsx` renders:
```tsx
<h1>Replit Agent is building...</h1>
<p>Your app will appear here once it's ready.</p>
```

- No routing logic beyond `/` → Home
- NotFound page exists but is trivial
- 50+ Radix UI components in `src/components/ui/` are imported nowhere
- Wouter router is wired but serves only Home + NotFound
- TanStack Query `QueryClient` is instantiated but unused

### 4.2 lib/api-client-react — Code Complete, Unused

`@workspace/api-client-react` is declared in `cuu-gioi/package.json` as `workspace:*` dependency, but:
- No import statements reference it in `artifacts/cuu-gioi/`
- Only generated artifact is `useHealthCheck` hook (unreachable from game)
- `customFetch` is well-designed (ApiError, ResponseParseError, bearer token support) but has no consumer

### 4.3 lib/db — Code Complete, No Schema

`lib/db/src/index.ts` wires up Drizzle + pg Pool, but `lib/db/src/schema/index.ts` is empty:
```ts
// All content is comments showing how to define tables
export {}
```

`api-server/package.json` declares `@workspace/db` as a dependency but `api-server/src/` does not import it. No Drizzle migration files exist.

### 4.4 lib/api-zod — Only HealthCheckResponse

Only `HealthCheckResponse` schema exists. No Player, Combat, Quest, Save schemas. Codegen pipeline works; spec content is minimal.

### 4.5 mockup-sandbox — Disconnected Tool

`artifacts/mockup-sandbox/` is a component preview tool with its own UI library. It does not interact with the game.

---

## 5. MISSING PIECES FOR PRODUCTION

### 5.1 Backend Logic (Critical Gap)

| Missing | Why It Matters |
|---------|---------------|
| Player CRUD endpoints | No server-side player state |
| Save/Load endpoints | Cannot persist to PostgreSQL |
| Combat/Cultivation/Quest endpoints | Game logic has no server authoritative source |
| Authentication endpoints | No user system, no accounts |
| Admin endpoints | Runtime Console is client-only |

### 5.2 Database Schema (Critical Gap)

Need at minimum:
- `players` table (id, name, realm, cultivation, gold, etc.)
- `saves` table (player_id, save_data JSON, timestamp)
- `inventory` table or JSON column
- `relationships` (NPC affinity)
- `story_state` (flags, completed, active)

Drizzle config exists; schema files need to be created.

### 5.3 Frontend Rewrite (Critical Gap)

Need:
- React component replacement for vanilla JS UI
- Integration of `api-client-react` for backend calls
- TanStack Query hooks for all game actions
- Routing for game screens (cultivation, combat, exploration, etc.)
- Form handling for save/load/import/export

### 5.4 Content Expansion

| Current | Needed for Production |
|---------|----------------------|
| 2 story nodes | 20+ nodes with branching |
| 5 explore events | 30+ events with conditional logic |
| 2 enemies | 15+ enemies with abilities |
| 1 quest | 10+ quest chains |
| 3 items | 30+ items (consumables, equipment, quest) |
| 3 locations | Multi-region world map |
| 1 NPC | Named cast with dialogue trees |

### 5.5 Quality Infrastructure

- **No tests** — no unit, integration, or e2e tests exist
- **No CI/CD** — no GitHub Actions, no linting enforced
- **No monitoring** — pino logs exist but no aggregation
- **No documentation** — replit.md is template; no ARCHITECTURE.md, CONTRIBUTING.md
- **No migrations** — Drizzle configured but no migration files

### 5.6 Security

- Runtime Console uses `eval()` — arbitrary code execution in browser
- No rate limiting on API
- No CORS restriction (uses default `cors()` — all origins)
- pino-http redacts Authorization but no auth to verify

---

## 6. TOP 5 TECHNICAL BOTTLENECKS (P0/P1/P2)

### #1 — Database + Backend API Schema Empty [P0 — CRITICAL]

**Description:** `lib/db/src/schema/index.ts` is empty. `api-server/src/routes/` contains only `health.ts`. The game has zero server-side persistence and zero game-action endpoints. IndexedDB is per-browser only.

**Impact:**
- Cannot save across devices/browsers
- Cannot have leaderboards, multiplayer, or shared world
- Cannot enforce authoritative game state
- Drizzle ORM + pg + Express are wired but completely unused

**Verified From:**
- `lib/db/src/schema/index.ts` (only comments)
- `artifacts/api-server/src/routes/` (only health.ts)
- `artifacts/api-server/src/app.ts` (only mounts `/api` router with health)

**Fix Complexity:** Medium — Drizzle config and Express app exist; need schema definitions, route files, pg connection string.

---

### #2 — Runtime Console eval() Security Vulnerability [P0 — CRITICAL]

**Description:** `runtime.js:219` and `runtime.js:596` execute user-provided code via `eval()`. Any actor with write access to localStorage (`CuuGioi_PreRuntimeModules` or `CuuGioi_RuntimeModules`) can execute arbitrary JavaScript in the user's browser context.

**Impact:**
- Local XSS vector: stored patches run in privileged scope
- Can read IndexedDB, modify player, exfiltrate save data
- No sandboxing — runs with full window/document access
- Admin Panel exposes console UI without auth gate

**Verified From:**
```js
// runtime.js:219
const result = eval(code);
// runtime.js:596
return eval(code);
```

**Fix Complexity:** Low — replace `eval()` with `new Function('return ...')()` in restricted scope, or use Web Workers, or remove feature entirely.

---

### #3 — Dual-Frontend Architecture Debt [P1 — IMPORTANT]

**Description:** Two parallel frontends coexist. The vanilla JS game in `index.html` is production-active. The React app in `src/` is a placeholder. The `lib/api-client-react` and `lib/api-zod` packages exist for React but are unused. Result: half the codebase is functional, half is dead weight.

**Impact:**
- New developers confused about which is the "real" frontend
- `lib/` packages cannot ship as-is because no consumer
- 50+ Radix UI components installed but not contributing
- Vite builds React shell that `index.html` never mounts

**Verified From:**
- `index.html` only loads `<script src="js/*.js">` — no React mount
- `src/App.tsx` shows placeholder text
- `lib/api-client-react/` has generated `useHealthCheck` hook with zero consumers
- `pnpm-workspace.yaml` catalog includes all React/UI deps for nothing

**Fix Complexity:** High — either rewrite game in React (large) or strip React scaffold (medium).

---

### #4 — PostgreSQL Connection Unverified [P1 — IMPORTANT]

**Description:** `lib/db/src/index.ts` requires `DATABASE_URL` env var and throws if missing. `api-server` declares `@workspace/db` as dependency but does not import it. No migration files. Drizzle config file referenced in `db/package.json` (`./drizzle.config.ts`) is not present in the codebase.

**Impact:**
- Cannot run API server against a real database
- Cannot test database-touching code
- DATABASE_URL provisioning is undefined
- Drizzle Kit commands (`pnpm push`, `pnpm push-force`) defined in `db/package.json` but no config exists

**Verified From:**
- `lib/db/src/index.ts:7-11` throws on missing DATABASE_URL
- `api-server/package.json` declares db dependency but no import
- `lib/db/package.json:11-13` scripts reference `drizzle.config.ts` (missing)

**Fix Complexity:** Medium — create drizzle.config.ts, define schema, create migration, provision DATABASE_URL.

---

### #5 — Content Saturation Sparsity [P2 — ENHANCEMENT]

**Description:** Only 2 story nodes, 5 explore events, 2 enemies, 1 quest, 3 items, 3 locations, 1 NPC. Game mechanics work but content is thin. Progression system (Phàm Nhân → Nguyên Anh) has 5 realms but only enough content to demonstrate 1.

**Impact:**
- Player runs out of content within first hour
- No replayability hooks
- No motivation to engage with cultivation loop
- NPC Ánh Tuyết is the only character

**Verified From:**
- `state.js:36-42` — 5 REALMS defined
- `state.js:44-60` — 2 ENEMIES (son_tho, lang_xam)
- `state.js:62-70` — 1 QUEST (first_step)
- `inventory.js:5-52` — 3 ITEMS
- `story.js:13-61` — 2 STORY NODES (bell_at_night, old_temple)
- `state.js:90-128` — 5 EXPLORE_EVENTS

**Fix Complexity:** High — requires game design iteration, not just code.

---

## 7. RECOMMENDED COMPLETION ORDER

### Phase 1: Stabilize Foundation (P0) — Weeks 1-2

**Step 1: Fix eval() Security (Bottleneck #2)**
- Replace `eval(code)` with sandboxed execution
- Or: gate Runtime Console behind dev-only flag
- Or: remove feature entirely if not used in production

**Step 2: Decide Frontend Architecture (Bottleneck #3)**
- **Option A:** Rewrite game in React — large investment, modern stack
- **Option B:** Strip React scaffold, keep vanilla JS — small investment, ship faster
- **Recommendation:** Option B unless team has React expertise and time

### Phase 2: Backend Persistence (P0) — Weeks 3-5

**Step 3: Provision Database (Bottleneck #4)**
- Create drizzle.config.ts in `lib/db/`
- Define initial schema: `players`, `saves`, `inventory`, `story_state`
- Generate first migration
- Set up dev database (Docker or local PostgreSQL)

**Step 4: Implement Game API Endpoints (Bottleneck #1)**
- Add player CRUD routes
- Add save/load routes
- Add game action routes (cultivate, combat, quest)
- Update OpenAPI spec → regenerate Zod + React Query clients
- Wire api-client-react into chosen frontend

### Phase 3: Content & Polish (P1-P2) — Weeks 6-10

**Step 5: Expand Content (Bottleneck #5)**
- Design 5+ quest chains
- Add 10+ story nodes
- Add 10+ explore events
- Add NPC dialogue system

**Step 6: Quality Infrastructure**
- Add unit tests for core game logic
- Add CI/CD pipeline (GitHub Actions)
- Add monitoring/alerting
- Write proper ARCHITECTURE.md and CONTRIBUTING.md

### Phase 4: Production Readiness — Weeks 11+

**Step 7: Authentication & Authorization**
- Add user accounts
- Add admin role separation
- Gate Runtime Console behind admin auth

**Step 8: Performance & Scale**
- Add rate limiting
- Add caching layer
- Add CDN for static assets
- Optimize Drizzle queries

---

## SUMMARY

The Cửu Giới codebase demonstrates a **partially-built monorepo** with a clear architecture intent but incomplete implementation:

- **Working:** Vanilla JS game engine with full gameplay loop, Runtime Console patch system, build pipeline, OpenAPI/Zod/React Query codegen infrastructure.
- **Not Working:** React app is placeholder, backend has only health check, database has no schema, frontend-backend are completely disconnected.
- **Critical Path:** Security fix (#2) + architectural decision (#3) must precede all other work. Then database schema + API endpoints (#1, #4) unblock real persistence.

The codebase is in a **pre-MVP state for production** but a **working demo** for the vanilla JS game itself.