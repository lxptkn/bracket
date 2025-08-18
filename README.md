## Citadel Chess – Admin Guide

This document explains how to manage seasons, participants, moderators, and brackets using the built‑in admin UI, plus reasonable limits for scale.

### Accessing Admin
- Open the main site and sign in using the top‑right button.
- Once signed in, use the “Admin” button (top‑right) to go to `/admin`.

### Seasons
- The Seasons section lets you add, select, and delete seasons.
- **Add a season**:
  - Type a name (e.g., `2024` or `June 2025`) and click “Add”. It appears in the grid.
- **Edit a season**:
  - Click “Edit” on the row to set it as the selected season.
- **Delete a season**:
  - Click the `-` button on the row and confirm. This removes it from the list.
  - Note: Deleting a season from the list does not delete its JSON files on disk (kept for safety/backups).

Data files are stored in `data/`:
- Seasons list: `data/seasons.json`
- Per‑season files (all under `data/seasons/`):
  - Bracket: `<season>.json`
  - Participants: `<season>-participants.json`
  - Moderators: `<season>-moderators.json`
  - Season meta (months): `<season>-meta.json`

### Current Season (Months)
- This section controls which season you are editing and its schedule.
- **Select season**: Use the “Editing” dropdown to switch the current season.
- **Pick months**: Choose a single month and year. The second month auto‑sets to the next month (year rolls over for December).
- Click “Save” to persist.

### Participants
- Two lists: Global Participants and Season Participants.
- **Add to Global**: Enter a name (and optional seed) and click “Add to Global List”.
- **Add to Season**: In Global list, click `+` to add that participant to the selected season.
- **Remove from Season**: In Season list, click `-` for the participant.
- **Regenerate Bracket**: Uses the current Season Participants order to rebuild Round 1, then auto‑propagates winners to later rounds.
  - You can also generate a seeded bracket by setting seeds globally, adding to season, and then using the dedicated API (`generateBracketFromParticipants`) in code if needed. The admin button regenerates based on the current order.

### Moderators
- Two lists: Global Moderators and Season Moderators.
- **Add to Global**: Enter a name and click “Add to Global List”.
- **Add to Season**: In Global list, click `+` to add to the selected season (max 8 enforced).
- **Remove from Season**: In Season list, click `-`.

### Winners (Admin)
- The “Set Winners” panel appears for the selected season.
- For each match, click a player name to set/clear the winner.
- Winners are highlighted consistently with the site theme (emerald).

### Main Page
- The main bracket page shows the public bracket, a season selector, the current season calendar, and the moderators.
- The bracket expands horizontally as needed; other sections are width‑constrained for readability.

### Reasonable Limits (Scale)
The app stores data as small JSON files and reads them on demand. Practical limits depend on server resources and usage patterns, but as guidance:
- **Seasons count**:
  - 0–500 seasons: Expected to be smooth in the admin UI and API.
  - 500–1,000 seasons: Still fine for the API; the admin seasons grid may feel busy. Consider search/pagination.
  - 1,000+ seasons: Consider migrating to a database and adding pagination/search in the admin.
- **Per‑season size**: Each season uses a handful of small JSON files (participants, bracket, moderators, meta). Thousands of seasons are acceptable in terms of disk space, but UI ergonomics and list rendering become the bottleneck.
- **Why it scales**: The bracket and season endpoints read only the files for the requested season; there’s no heavy aggregation over all seasons at runtime. The primary place a large list matters is the admin seasons grid and the `/api/seasons` list.

### Backups
- Back up the `data/` directory to preserve seasons, brackets, participants, moderators, and month metadata.
- Deleting a season from the list does not remove its files; you can restore the list by editing `data/seasons.json` directly if needed.

### Notes
- Max moderators per season is 8 (enforced by the admin UI/backend helper).
- Buttons are square‑edged, dark‑themed, with pointer hover; the public “Admin” button only appears when logged in.


