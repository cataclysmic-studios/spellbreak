# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` in this repo is a separate physical file with identical content (not a symlink) — when editing this file, apply the same edit to `AGENTS.md` too.

## Project

Spellbreak — a Wizard101-style Roblox game, written in roblox-ts (TypeScript compiled to Luau) on top of Flamework (DI/services) and Vide (reactive UI).

## Commands

```bash
npm run build   # one-shot rbxtsc compile: src/ (TypeScript) -> dist/ (Luau)
npm run watch   # rbxtsc -w, recompiles on change
```

Rojo (`rojo-rbx/rojo@7.4.4`, managed via `rokit.toml`/Rokit) syncs `dist/` and `node_modules` into Roblox Studio per `default.project.json`:
- `dist/server` -> `ServerScriptService.TS`
- `dist/shared` -> `ReplicatedStorage.TS`
- `dist/client` -> `StarterPlayer.StarterPlayerScripts.TS`
- `node_modules/@rbxts` and `node_modules/@flamework` -> `ReplicatedStorage.rbxts_include.node_modules`

There is no configured lint or test script. UI components are visually verified via Hoarcekat stories (see below), not automated tests.

When debugging a runtime error reported from Roblox Studio, the line numbers refer to the compiled Luau in `dist/`, not the TypeScript source in `src/`. **True source maps don't exist for this toolchain** — Luau stack traces always report positions in the compiled `.luau` file, and `rbxtsc` emits no line-mapping metadata back to `src/`, so a dist line number only ever approximately corresponds to a src line number (import consolidation, decorator/metadata codegen, and helper expansion for things like spread/iteration all shift it). What *is* fully mechanical is the **path** translation, since `rbxtsc` emits one Luau module per TS file with the same relative path: `<name>.ts(x)` -> `<name>.luau`, and a folder containing an `index.ts` -> `<folder>/init.luau` (e.g. `src/shared/structs/data/index.ts` -> `dist/shared/structs/data/init.luau`). Combined with the wholesale `dist/<realm>` -> `<Instance root>.TS` sync above, a Studio Instance path is a dotted, extension-less mirror of that filesystem path (e.g. `ServerScriptService.TS.services.quest` -> `dist/server/services/quest.luau` -> `src/server/services/quest.ts`) — note client-side errors report under the runtime alias `Players.<name>.PlayerScripts.TS.*` rather than the edit-time `StarterPlayer.StarterPlayerScripts.TS.*`. Use [map-error](#helper-scripts) to do this translation and get a side-by-side windowed view instead of re-deriving it by hand.

### Helper scripts

`scripts/*.mjs` (plain Node, run with `npm run <name>` or `node scripts/<file>.mjs`) do small repo-specific static analysis so you don't have to grep/read files by hand every time:
- `npm run list:services` — lists every `@Service()`/`@Controller()` class with its file and constructor-injected DI dependencies (the whole client/server DI graph at a glance).
- `npm run list:stories` — lists every Hoarcekat story under `shared/ui/stories` and which component/view file it previews.
- `npm run find:content -- <query>` — searches `shared/game-data/**` by filename or content and dumps the full matching file(s); game-data files are small and declarative, so this beats grepping line-by-line when you just need "where is NpcID.X / QuestID.Y defined".
- `npm run check:vide` — walks `node_modules` on disk (not `npm ls`, which is misleading here — see gotcha below) to confirm only one physical `@rbxts/vide` copy exists. Run after any `npm install`/`npm update` that touches vide-adjacent deps.
- `npm run map-error -- "<StudioInstancePath>:<line>"` (or a `dist/**/*.luau:<line>` / `src/**/*.ts(x)` path) — resolves a Studio stack-trace line to its src file and prints windowed context from both dist and src around that line, per the path-translation rule above. The src window is centered on the same line number as a best-effort guess, not a real mapping — scan a few lines either way.

## Architecture

**Three-realm split**: `src/server`, `src/client`, `src/shared`, mirroring the Rojo tree above. `shared` code runs on both realms (UI components, data structs, game-content definitions, networking helpers). Server-only game logic lives in `server/services` and `server/classes`; client-only in `client/controllers` and `client/classes`.

**Flamework DI**: `server/main.server.ts` and `client/main.client.ts` each call `Flamework.addPaths(...)` then `Flamework.ignite()`. Services (`@Service()`, server) and Controllers (`@Controller()`, client) are singletons constructor-injected into each other by Flamework; `server/hooks/players.ts` defines the `OnPlayerJoin`/`OnPlayerLeave` lifecycle interfaces services implement.

**Networking** goes through `@rbxts/tether`'s `MessageEmitter` (`shared/messaging.ts`): a single `Message` const enum plus a `MessageData` interface mapping each message to its payload type keeps client/server payloads type-checked together. `shared/meta.ts` wraps this in `@OnServerMessage(Message.X)` / `@OnClientMessage(Message.X)` method decorators for use inside Flamework services/controllers, dispatched via `callMethodOnDependencies` so the decorated method still resolves through DI.

**Player data & replication**: `server/services/database.ts` persists `PlayerData` via `@rbxts/lapis` (DataStore wrapper), keyed `Player<userId>_<VERSION>` — bump `VERSION` on breaking schema changes. On load/change the server diffs data (`shared/utility/data.ts`'s `createDiff`) and sends only the diff over `Message.Data_Updated`; the client's `client/controllers/replica.ts` (`ReplicaController`) applies the patch (`applyPatch`) to its local `PlayerData` copy and fires an `updated` signal. Data schemas live under `shared/structs/data`.

**Game content as data**: `shared/game-data/**` holds declarative content definitions (spells, npcs, enemies, dialog trees, quests, items/gear/decks), typed against interfaces in `shared/structs/**`. Adding new content generally means adding a file here rather than writing new logic. Every one of these files follows the same shape: a `const enum XID` + `XDescriptor extends BaseID<XID>` pair in `shared/structs/**`, then one file per entry under `game-data/**` exporting `export = { id: XID.Entry, ... } satisfies XDescriptor` (roblox-ts's single-default-export form — not `export default`). Quest/dialog content is further namespaced by world/chapter, e.g. `game-data/quests/wc/3.ts`, `game-data/dialog/<npc-slug>/wc3-*.ts` — use [find:content](#helper-scripts) to locate an entry by ID name rather than grepping by hand.

**UI (Vide)**: `tsconfig.json` sets `jsxFactory: Vide.jsx` / `jsxFragmentFactory: Vide.Fragment`, so any `.tsx` file authors Vide UI. Components live in `shared/ui/components`, full screens in `shared/ui/views`, hooks in `shared/ui/hooks` (e.g. `use-px.ts` for resolution-independent scaling via `@rbxts/pretty-vide-utils`), and `shared/ui/state.ts` holds shared reactive UI state (via `@rbxts/charm`/Vide sources). `shared/ui/dev.ts` turns on `Vide.strict` mode and a `_G.__DEV__` flag under `RunService.IsStudio()`.
  - UI components that use client-only hooks (`usePx`, `useCamera`, anything from `pretty-vide-utils` touching `Workspace.CurrentCamera`/viewport) must only be mounted on the client. Mounting them from server code (e.g. a `Vide.mount()` inside a server-side class constructor) is invalid, even though `Vide.mount`/`root` themselves run fine headless on the server.
  - `shared/ui/stories/**` are Hoarcekat stories (`shared/ui/utility/hoarcekat.ts` wraps a component as `(target: Instance) => Vide.mount(...)`) used to preview individual components/views in Studio without running the full game — the primary way UI is manually verified in this repo.

**In-world entities**: `server/classes/npc.tsx`, `enemy.tsx` extend `named-npc.tsx`'s `NamedNPC`, which mounts a `NametagContainer` (BillboardGui) onto the entity's model root and owns cleanup via `@rbxts/destroyable`'s `Destroyable`/`trash`.

## Style

Avoid comments as much as possible. Don't explain what code does or restate types/props in a comment — well-named identifiers should carry that. Only write one when the WHY is genuinely non-obvious (a hidden constraint, a workaround for a specific bug, behavior that would surprise a reader). This includes doc comments (JSDoc/docblocks) on functions, props, and interfaces — don't add one out of convention just because a function or prop exists; the same non-obvious bar applies, and no comment at all is the default. Avoid inline (trailing, same-line) comments specifically — if a WHY-comment is warranted, put it on its own line above the code it explains, not appended after it.

Fix code smells and structural issues encountered in code you're touching for a prompted change, rather than leaving them or just flagging them — don't defer beneficial structural cleanup to a separate pass. This overrides the general default of not refactoring beyond what a task requires; use judgment on scope (folding in a local cleanup while editing a file is expected, a repo-wide rewrite is not — raise that separately instead).

## Known gotchas

- `@rbxts/pretty-vide-utils` declares `@rbxts/vide: ^0.5.0` while this project pins `@rbxts/vide: ^0.6.1`; npm previously resolved this by installing a second, nested copy of `@rbxts/vide` inside `pretty-vide-utils`'s own `node_modules`. Because Rojo syncs each copy as a *separate* Luau ModuleScript tree, they hold independent reactive-scope state — hooks compiled against the nested copy (`useCamera`, `useEventListener`, etc.) can't see scopes pushed by the top-level copy's `root()`/`mount()`/`jsx()`, producing `cannot cleanup outside a stable or reactive scope` at runtime. Fixed via a root `"overrides"` entry in `package.json` forcing a single `@rbxts/vide` version tree-wide — keep that override in place, and if a similar error reappears after adding/upgrading a Vide-adjacent dependency, run `npm run check:vide` (walks the physical `node_modules` layout — plain `npm ls @rbxts/vide` still reports two logical entries even when the override has deduped them to one copy on disk, so it isn't a reliable check here) before debugging the UI code itself.

## Commits

Commit subjects follow `<type>: <description>` (`feat`/`fix`/`build` observed so far), lowercase, no trailing period, no scope — see `git log --oneline` for examples.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
rtk uv run <cmd>        # Compact uv project command output
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
