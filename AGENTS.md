# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

When debugging a runtime error reported from Roblox Studio, the line numbers refer to the compiled Luau in `dist/`, not the TypeScript source in `src/` — map the erroring `dist/**/*.lua` line back to the corresponding `src/**/*.ts(x)` file before editing.

## Architecture

**Three-realm split**: `src/server`, `src/client`, `src/shared`, mirroring the Rojo tree above. `shared` code runs on both realms (UI components, data structs, game-content definitions, networking helpers). Server-only game logic lives in `server/services` and `server/classes`; client-only in `client/controllers` and `client/classes`.

**Flamework DI**: `server/main.server.ts` and `client/main.client.ts` each call `Flamework.addPaths(...)` then `Flamework.ignite()`. Services (`@Service()`, server) and Controllers (`@Controller()`, client) are singletons constructor-injected into each other by Flamework; `server/hooks/players.ts` defines the `OnPlayerJoin`/`OnPlayerLeave` lifecycle interfaces services implement.

**Networking** goes through `@rbxts/tether`'s `MessageEmitter` (`shared/messaging.ts`): a single `Message` const enum plus a `MessageData` interface mapping each message to its payload type keeps client/server payloads type-checked together. `shared/meta.ts` wraps this in `@OnServerMessage(Message.X)` / `@OnClientMessage(Message.X)` method decorators for use inside Flamework services/controllers, dispatched via `callMethodOnDependencies` so the decorated method still resolves through DI.

**Player data & replication**: `server/services/database.ts` persists `PlayerData` via `@rbxts/lapis` (DataStore wrapper), keyed `Player<userId>_<VERSION>` — bump `VERSION` on breaking schema changes. On load/change the server diffs data (`shared/utility/data.ts`'s `createDiff`) and sends only the diff over `Message.Data_Updated`; the client's `client/controllers/replica.ts` (`ReplicaController`) applies the patch (`applyPatch`) to its local `PlayerData` copy and fires an `updated` signal. Data schemas live under `shared/structs/data`.

**Game content as data**: `shared/game-data/**` holds declarative content definitions (spells, npcs, enemies, dialog trees, quests, items/gear/decks), typed against interfaces in `shared/structs/**`. Adding new content generally means adding a file here rather than writing new logic.

**UI (Vide)**: `tsconfig.json` sets `jsxFactory: Vide.jsx` / `jsxFragmentFactory: Vide.Fragment`, so any `.tsx` file authors Vide UI. Components live in `shared/ui/components`, full screens in `shared/ui/views`, hooks in `shared/ui/hooks` (e.g. `use-px.ts` for resolution-independent scaling via `@rbxts/pretty-vide-utils`), and `shared/ui/state.ts` holds shared reactive UI state (via `@rbxts/charm`/Vide sources). `shared/ui/dev.ts` turns on `Vide.strict` mode and a `_G.__DEV__` flag under `RunService.IsStudio()`.
  - UI components that use client-only hooks (`usePx`, `useCamera`, anything from `pretty-vide-utils` touching `Workspace.CurrentCamera`/viewport) must only be mounted on the client. Mounting them from server code (e.g. a `Vide.mount()` inside a server-side class constructor) is invalid, even though `Vide.mount`/`root` themselves run fine headless on the server.
  - `shared/ui/stories/**` are Hoarcekat stories (`shared/ui/utility/hoarcekat.ts` wraps a component as `(target: Instance) => Vide.mount(...)`) used to preview individual components/views in Studio without running the full game — the primary way UI is manually verified in this repo.

**In-world entities**: `server/classes/npc.tsx`, `enemy.tsx` extend `named-npc.tsx`'s `NamedNPC`, which mounts a `NametagContainer` (BillboardGui) onto the entity's model root and owns cleanup via `@rbxts/destroyable`'s `Destroyable`/`trash`.

## Known gotchas

- `@rbxts/pretty-vide-utils` declares `@rbxts/vide: ^0.5.0` while this project pins `@rbxts/vide: ^0.6.1`; npm previously resolved this by installing a second, nested copy of `@rbxts/vide` inside `pretty-vide-utils`'s own `node_modules`. Because Rojo syncs each copy as a *separate* Luau ModuleScript tree, they hold independent reactive-scope state — hooks compiled against the nested copy (`useCamera`, `useEventListener`, etc.) can't see scopes pushed by the top-level copy's `root()`/`mount()`/`jsx()`, producing `cannot cleanup outside a stable or reactive scope` at runtime. Fixed via a root `"overrides"` entry in `package.json` forcing a single `@rbxts/vide` version tree-wide — keep that override in place, and if a similar error reappears after adding/upgrading a Vide-adjacent dependency, check `node_modules/**/node_modules/@rbxts/vide` for a reintroduced duplicate before debugging the UI code itself.
