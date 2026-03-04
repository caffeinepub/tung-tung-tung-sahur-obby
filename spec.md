# Tung Tung Tung Sahur Obby

## Current State
The game has a level editor and community levels system. The backend stores custom levels in a `Map<Principal, CustomLevel>`, meaning only one level can exist per user identity. When any new user publishes a level it overwrites the previous entry stored under their principal key. Since anonymous users all share the same anonymous principal, publishing overwrites the same slot every time, deleting all prior community levels.

The frontend `CommunityLevels.tsx` renders levels returned by `getPublicLevels()`. The `LevelEditor.tsx` calls `saveCustomLevel()` on publish. `App.tsx` also calls `getMyLevel()` to pre-load the editor with the user's existing level.

## Requested Changes (Diff)

### Add
- New list-based storage in the backend: `customLevelsById : Map<Nat, CustomLevel>` keyed by unique auto-increment ID, so every published level gets its own slot regardless of who published it.
- New query `getPublicLevels()` that returns all levels sorted newest-first (up to 100).
- New query `getLevelById(id: Nat)` to fetch a single level.
- New update `deleteLevel(id: Nat)` that only allows the original author (or owner) to delete.

### Modify
- `saveCustomLevel` — instead of `customLevels.add(caller, newLevel)`, insert into `customLevelsById` with a new unique ID each time, so each publish creates a new entry and never overwrites existing ones.
- `getMyLevel` — return the most recent level where `author == caller` (optional, may return null if none).
- `deleteMyLevel` — remove the most recent level authored by caller (keep for backward-compat).

### Remove
- The old `Map<Principal, CustomLevel>` (`customLevels`) map.

## Implementation Plan
1. Replace `let customLevels = Map.empty<Principal, CustomLevel>()` with `let customLevelsById = Map.empty<Nat, CustomLevel>()`.
2. Update `saveCustomLevel` to insert with `nextLevelId` key, then increment `nextLevelId`.
3. Update `getPublicLevels` to iterate `customLevelsById.values()`, sort by `createdAt` descending, return up to 100.
4. Update `getMyLevel` to filter `customLevelsById` for entries where `author == caller`, return the most recent one.
5. Update `deleteMyLevel` to find and remove the most recent level where `author == caller`.
6. Add `getLevelById(id: Nat)` query.
7. Add `deleteLevel(id: Nat)` update that checks caller is the level author.
8. Keep all other backend logic (stats, leaderboard, usernames) unchanged.
9. Update frontend `CommunityLevels.tsx` and `App.tsx`/`LevelEditor.tsx` if any API shape changes.
