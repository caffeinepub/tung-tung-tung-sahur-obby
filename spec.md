# Tung Tung Tung Sahur Obby

## Current State
- Players can publish unlimited custom levels to the community pool (up to 100 shown)
- The level editor has a single save/work-in-progress slot
- `saveCustomLevel` stores each publish as a new entry with a unique ID
- `getMyLevel` returns only the most recently created level by the caller
- `deleteLevel` allows authors to delete their own levels by ID

## Requested Changes (Diff)

### Add
- Backend: `getMyLevels` query -- returns all levels (up to 2) published by the caller, sorted by `createdAt` descending
- Backend: Enforce max 2 published levels per principal in `saveCustomLevel` -- trap with "You already have 2 published levels. Delete one before publishing again." if limit is reached
- Frontend: Level editor has 2 save slots ("Slot 1" / "Slot 2") -- player can switch between them; each slot stores its own level name, platforms, world width, bg hue independently in localStorage
- Frontend: "My Levels" section in Community Levels screen showing the caller's 1-2 published levels with a delete button on each
- Frontend: When publishing, show error if limit reached and prompt to delete an existing level first

### Modify
- Backend: `saveCustomLevel` -- add count check before inserting
- Frontend: Level editor "Save & Publish" flow -- after publish, refresh "My Levels" count so the limit is reflected immediately
- Frontend: Community Levels screen -- display player's own published levels separately at the top with slot labels

### Remove
- Nothing removed

## Implementation Plan
1. Update `saveCustomLevel` in `main.mo` to count caller's existing levels and trap if >= 2
2. Add `getMyLevels` query to `main.mo` returning `[CustomLevel]` for the caller
3. Regenerate backend (Motoko)
4. Update frontend level editor to support 2 localStorage save slots with a toggle UI
5. Update Community Levels screen to show "My Published Levels" section at top with delete buttons
6. Wire publish error handling to show the limit message clearly
7. Deploy
