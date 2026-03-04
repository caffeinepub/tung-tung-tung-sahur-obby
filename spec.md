# Tung Tung Tung Sahur Obby

## Current State
A 10-stage platformer obby game with username system, leaderboard (fastest times + top players), level editor, and community levels. Usernames are stored in the backend and displayed in the HUD, start screen, and leaderboard.

## Requested Changes (Diff)

### Add
- Owner tag logic: the username `tung_master` is hardcoded as the owner
- A helper function `isOwner(name: string): boolean` that returns true when name === "tung_master"
- Wherever a username is displayed, if `isOwner(name)` is true, render the name in green (`#22c55e` / Tailwind `text-green-500`) with a small crown emoji prefix (👑) to distinguish the owner

### Modify
- `App.tsx` — `StartScreen`: the "Playing as" badge should show the username in green with crown if owner
- `App.tsx` — `HUD`: the username panel should show username in green with crown if owner
- `App.tsx` — `LeaderboardSection` (mini leaderboard on win screen): apply green + crown to owner name
- `Leaderboard.tsx` — `SpeedRow` and `TopRow`: apply green + crown to owner name when displayed

### Remove
- Nothing removed

## Implementation Plan
1. Add a shared `OWNER_USERNAME` constant (`"tung_master"`) and `isOwner(name: string)` helper near the top of `App.tsx` (or a shared util)
2. In `App.tsx` `StartScreen`, wrap the username span: if owner, add `👑 ` prefix and green inline style
3. In `App.tsx` `HUD`, wrap the username display: if owner, apply green color and crown prefix
4. In `App.tsx` `LeaderboardSection`, when rendering `displayName`, check owner and apply green style + crown
5. In `Leaderboard.tsx` `SpeedRow` and `TopRow`, after resolving `displayName`, check if `displayName === OWNER_USERNAME` (or pass a helper) and apply green style + crown prefix
