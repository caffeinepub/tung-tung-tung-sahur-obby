# Tung Tung Tung Sahur Obby

## Current State
- Backend tracks `bestStage`, `totalDeaths`, `totalWins` per player
- `saveGameResult(stageReached, deathsThisRun)` records stats
- `getLeaderboard()` returns top 10 sorted by bestStage then fewest deaths
- Frontend shows a small inline "Top Survivors" leaderboard on start/win screens (top 3 entries)
- No time tracking exists

## Requested Changes (Diff)

### Add
- Backend: `bestCompletionTimeMs` field (Nat) in UserStats — 0 means never completed
- Backend: `saveGameResult` accepts a new `completionTimeMs` arg (Nat); updates `bestCompletionTimeMs` only when it's a full win (stage 10) and time is better than existing best (or first completion)
- Backend: `getSpeedLeaderboard()` query returning top 10 players who have completed the game, sorted by fastest `bestCompletionTimeMs`
- Frontend: `GameScreen` type gains `"leaderboard"` value
- Frontend: Full `LeaderboardScreen` component with two tabs — "Fastest Times" (completions only, sorted by time) and "Top Players" (sorted by best stage then fewest deaths)
- Frontend: "🏆 LEADERBOARD" button on start screen navigating to leaderboard screen
- Frontend: Time tracking in game — start timer when game starts, stop on win, pass elapsed ms to `saveGameResult`
- Frontend: Display formatted time (mm:ss.ms) in win screen stats row

### Modify
- Backend: `saveGameResult` signature gains third param `completionTimeMs : Nat`
- Frontend: `handleWin` passes elapsed time to `saveGameResult`
- Frontend: `WinScreen` shows time stat when available
- Frontend: Start screen leaderboard replaced by a button linking to the new full leaderboard screen

### Remove
- Frontend: Inline `LeaderboardSection` on start screen (replaced by dedicated screen)

## Implementation Plan
1. Update `main.mo`: add `bestCompletionTimeMs` to `UserStats`, update `saveGameResult` to accept and store time, add `getSpeedLeaderboard()` sorted by time
2. Update frontend `App.tsx`: add `leaderboard` screen type, timer ref, pass time to backend, wire leaderboard button
3. Create `Leaderboard.tsx` component with Fastest Times / Top Players tabs
4. Update start screen to show leaderboard button instead of inline entries
5. Update win screen to show formatted completion time
