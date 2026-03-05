# Tung Tung Tung Sahur Obby

## Current State
Full obby game with 10 stages, community levels, level editor, leaderboard, stopwatch, and a username system. The username system currently has stale/corrupt data — players are seeing "tung_master" (the owner name) instead of being prompted to register their own name. The owner wants to wipe all username registrations so everyone starts fresh.

## Requested Changes (Diff)

### Add
- `adminResetUsernames()` — owner-only function that clears both `usernames` and `principalToUsername` maps entirely
- `claimOwnerPrincipal()` — stores the caller's principal as the owner when called with the correct secret phrase, so the owner can later call `adminResetUsernames()`
- A hidden "Reset Names" button in the frontend accessible only when the logged-in username is `tung_master`, which calls `adminResetUsernames()` and then clears local storage so the owner is also re-prompted

### Modify
- Backend: keep all existing functionality unchanged; only add the two new admin functions
- Frontend: after `adminResetUsernames()` succeeds, clear localStorage username key and reload the page so the owner is also re-prompted for a new name

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with all existing functions plus the two new admin functions (`claimOwnerPrincipal`, `adminResetUsernames`)
2. Update frontend App.tsx to include a hidden reset button visible only to `tung_master`, wired to the new backend call
3. On successful reset, clear the local `username` key in localStorage and reload
