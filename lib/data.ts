import { promises as fs } from 'fs'
import path from 'path'

/**
 * File-based data layer for seasons, brackets, participants, and moderators.
 *
 * This module persists JSON under `data/` and `data/seasons/`.
 * It also contains helper logic to propagate winners to subsequent rounds.
 */

const root = process.cwd()
const dirData = path.join(root, 'data')
const dirSeasons = path.join(dirData, 'seasons')
const fileSeasonsList = path.join(dirData, 'seasons.json')
const fileGlobalParticipants = path.join(dirData, 'participants.json')
const fileGlobalModerators = path.join(dirData, 'moderators.json')

export type Player = { name: string; seed?: number; score?: number }
export type Match = { matchNumber: number; player1: Player; player2: Player; winner?: string }
export type Bracket = Record<string, Match[]>
export type Moderator = { name: string }

async function ensureBaseDirs() {
  await fs.mkdir(dirSeasons, { recursive: true })
}

/** Read the list of known seasons. */
export async function getSeasons(): Promise<string[]> {
  try {
    const content = await fs.readFile(fileSeasonsList, 'utf8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/** Load a season's bracket JSON if present. */
export async function getBracket(season: string): Promise<Bracket | null> {
  try {
    const file = path.join(dirSeasons, `${season}.json`)
    const content = await fs.readFile(file, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/** Persist a season's bracket JSON. */
export async function saveBracket(season: string, bracket: Bracket) {
  await ensureBaseDirs()
  const file = path.join(dirSeasons, `${season}.json`)
  await fs.writeFile(file, JSON.stringify(bracket, null, 2), 'utf8')
}

/**
 * Set or clear the winner of a match, then propagate downstream rounds.
 */
export async function setWinner(
  season: string,
  round: string,
  matchNumber: number,
  winner: string | null | undefined
) {
  const bracket = (await getBracket(season)) || {}
  const matches = bracket[round] || []
  const idx = matches.findIndex((m) => m.matchNumber === matchNumber)
  if (idx >= 0) {
    if (!winner || winner === matches[idx].winner) {
      // Clear winner if same clicked again or falsy provided
      delete matches[idx].winner
    } else {
      matches[idx].winner = winner
    }
    bracket[round] = matches
  }
  propagateNextRounds(bracket)
  await saveBracket(season, bracket)
}

/** Add a season to the seasons list and initialize its bracket file. */
export async function addSeason(season: string) {
  await ensureBaseDirs()
  const seasons = await getSeasons()
  if (!seasons.includes(season)) {
    seasons.push(season)
    await fs.writeFile(fileSeasonsList, JSON.stringify(seasons.sort().reverse(), null, 2), 'utf8')
    await saveBracket(season, {})
  }
}

/** Remove a season from the list (keeps its JSON files on disk). */
export async function removeSeason(season: string) {
  await ensureBaseDirs()
  const seasons = await getSeasons()
  const next = seasons.filter((s) => s !== season)
  await fs.writeFile(fileSeasonsList, JSON.stringify(next.sort().reverse(), null, 2), 'utf8')
  // Note: We intentionally do not delete per-season files to avoid accidental data loss.
}

// ----- Season metadata (e.g., months) -----
function seasonMetaFile(season: string) {
  return path.join(dirSeasons, `${season}-meta.json`)
}

/** Read season-level metadata such as the two display months. */
export async function getSeasonMeta(
  season: string
): Promise<{ month1?: string; month2?: string }> {
  try {
    const content = await fs.readFile(seasonMetaFile(season), 'utf8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

/** Save season-level metadata (e.g., months). */
export async function saveSeasonMeta(
  season: string,
  meta: { month1?: string; month2?: string }
) {
  await ensureBaseDirs()
  await fs.writeFile(seasonMetaFile(season), JSON.stringify(meta, null, 2), 'utf8')
}

// Participants helpers (stored per-season in a separate JSON file)
function participantsFile(season: string) {
  return path.join(dirSeasons, `${season}-participants.json`)
}

/** Read participants for a season. */
export async function getParticipants(season: string): Promise<Player[]> {
  try {
    const content = await fs.readFile(participantsFile(season), 'utf8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/** Save participants for a season. */
export async function saveParticipants(season: string, participants: Player[]) {
  await ensureBaseDirs()
  await fs.writeFile(participantsFile(season), JSON.stringify(participants, null, 2), 'utf8')
}

/** Add a participant to a season, then regenerate the bracket from order. */
export async function addParticipant(season: string, player: Player) {
  const participants = await getParticipants(season)
  // Prevent duplicate by name
  if (participants.some((p) => p.name.toLowerCase() === player.name.toLowerCase())) {
    return
  }
  participants.push(player)
  await saveParticipants(season, participants)
  await regenerateBracketFromParticipantsInOrder(season)
}

/** Remove a participant from a season, then regenerate the bracket from order. */
export async function removeParticipant(season: string, name: string) {
  const participants = await getParticipants(season)
  const filtered = participants.filter((p) => p.name !== name)
  await saveParticipants(season, filtered)
  await regenerateBracketFromParticipantsInOrder(season)
}

// Generate Round 1 bracket from participants using standard seeding pairing (1 vs N, 2 vs N-1, ...)
export async function generateBracketFromParticipants(season: string) {
  const participants = await getParticipants(season)
  if (participants.length < 2) return

  // Sort by seed if available, otherwise by name
  const ordered = [...participants].sort((a, b) => {
    const sa = a.seed ?? Number.POSITIVE_INFINITY
    const sb = b.seed ?? Number.POSITIVE_INFINITY
    if (sa === sb) return a.name.localeCompare(b.name)
    return sa - sb
  })

  // Ensure even number by dropping the last if odd (or you could insert a BYE player)
  const evenCount = ordered.length - (ordered.length % 2)
  const trimmed = ordered.slice(0, evenCount)

  const matches: Match[] = []
  const n = trimmed.length
  for (let i = 0; i < n / 2; i += 1) {
    const player1 = trimmed[i]
    const player2 = trimmed[n - 1 - i]
    matches.push({ matchNumber: i + 1, player1, player2 })
  }

  const bracket: Bracket = { 'Round 1': matches }
  propagateNextRounds(bracket)
  await saveBracket(season, bracket)
}

// Generate Round 1 bracket from participants in the order they were added.
// Pair (0 vs 1), (2 vs 3), ... and ignore a trailing odd participant.
export async function regenerateBracketFromParticipantsInOrder(season: string) {
  const participants = await getParticipants(season)
  const matches: Match[] = []
  for (let i = 0; i + 1 < participants.length; i += 2) {
    matches.push({ matchNumber: i / 2 + 1, player1: participants[i], player2: participants[i + 1] })
  }
  const bracket: Bracket = { 'Round 1': matches }
  propagateNextRounds(bracket)
  await saveBracket(season, bracket)
}

// ---- Global participants (shared across seasons) ----
export async function getGlobalParticipants(): Promise<Player[]> {
  try {
    const content = await fs.readFile(fileGlobalParticipants, 'utf8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/** Persist the global participants list. */
export async function saveGlobalParticipants(players: Player[]) {
  await ensureBaseDirs()
  await fs.writeFile(fileGlobalParticipants, JSON.stringify(players, null, 2), 'utf8')
}

/** Add a participant to the global list if not already present. */
export async function addGlobalParticipant(player: Player) {
  const players = await getGlobalParticipants()
  if (players.some((p) => p.name.toLowerCase() === player.name.toLowerCase())) return
  players.push({ name: player.name, seed: player.seed })
  players.sort((a, b) => a.name.localeCompare(b.name))
  await saveGlobalParticipants(players)
}

/** Remove a participant from the global list by name (case-insensitive). */
export async function removeGlobalParticipant(name: string) {
  const players = await getGlobalParticipants()
  const next = players.filter((p) => p.name.toLowerCase() !== name.toLowerCase())
  await saveGlobalParticipants(next)
}

// ---- Global moderators ----
export async function getGlobalModerators(): Promise<Moderator[]> {
  try {
    const content = await fs.readFile(fileGlobalModerators, 'utf8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/** Save the global moderators list. */
export async function saveGlobalModerators(list: Moderator[]) {
  await ensureBaseDirs()
  await fs.writeFile(fileGlobalModerators, JSON.stringify(list, null, 2), 'utf8')
}

/** Add a moderator to the global list if not present. */
export async function addGlobalModerator(mod: Moderator) {
  const list = await getGlobalModerators()
  if (list.some((m) => m.name.toLowerCase() === mod.name.toLowerCase())) return
  list.push({ name: mod.name })
  list.sort((a, b) => a.name.localeCompare(b.name))
  await saveGlobalModerators(list)
}

/** Remove a moderator from the global list by name (case-insensitive). */
export async function removeGlobalModerator(name: string) {
  const list = await getGlobalModerators()
  const next = list.filter((m) => m.name.toLowerCase() !== name.toLowerCase())
  await saveGlobalModerators(next)
}

// ---- Season moderators (per-season) ----
function seasonModeratorsFile(season: string) {
  return path.join(dirSeasons, `${season}-moderators.json`)
}

/** Get moderators assigned to a season. */
export async function getSeasonModerators(season: string): Promise<Moderator[]> {
  try {
    const content = await fs.readFile(seasonModeratorsFile(season), 'utf8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

/** Save moderators for a season. */
export async function saveSeasonModerators(season: string, list: Moderator[]) {
  await ensureBaseDirs()
  await fs.writeFile(seasonModeratorsFile(season), JSON.stringify(list, null, 2), 'utf8')
}

/** Add a moderator to a season (max 8, case-insensitive uniqueness). */
export async function addModeratorToSeason(season: string, name: string) {
  const list = await getSeasonModerators(season)
  if (list.some((m) => m.name.toLowerCase() === name.toLowerCase())) return
  if (list.length >= 8) {
    // Enforce a maximum of 8 moderators as implied by the UI
    return
  }
  list.push({ name })
  list.sort((a, b) => a.name.localeCompare(b.name))
  await saveSeasonModerators(season, list)
}

/** Remove a moderator from a season by name (case-insensitive). */
export async function removeModeratorFromSeason(season: string, name: string) {
  const list = await getSeasonModerators(season)
  const next = list.filter((m) => m.name.toLowerCase() !== name.toLowerCase())
  await saveSeasonModerators(season, next)
}

// ----- Round propagation helpers -----
const roundOrder = ['Round 1', 'Quarterfinals', 'Semifinals', 'Finals'] as const

/** Get the next round's display name, or null if at the last round. */
function getNextRoundName(currentRound: string): string | null {
  const i = roundOrder.indexOf(currentRound as any)
  if (i < 0 || i >= roundOrder.length - 1) return null
  return roundOrder[i + 1]
}

/** Build the next round's matches from a previous round's winners. */
function buildNextRoundFromWinners(prevMatches: Match[], existingNext: Match[] | undefined): Match[] {
  const out: Match[] = []
  for (let i = 0; i < prevMatches.length; i += 2) {
    const m1 = prevMatches[i]
    const m2 = prevMatches[i + 1]
    const p1Name = m1?.winner ?? ''
    const p2Name = m2?.winner ?? ''
    const player1: Player = { name: p1Name }
    const player2: Player = { name: p2Name }

    const nextIndex = out.length
    const prior = existingNext?.[nextIndex]
    const preservedWinner = prior?.winner && (prior.winner === player1.name || prior.winner === player2.name)
      ? prior.winner
      : undefined

    out.push({ matchNumber: nextIndex + 1, player1, player2, ...(preservedWinner ? { winner: preservedWinner } : {}) })
  }
  return out
}

/** Propagate winners through subsequent rounds, clearing when insufficient. */
function propagateNextRounds(bracket: Bracket) {
  // Starting from Round 1, progressively compute subsequent rounds from winners.
  for (let r = 0; r < roundOrder.length - 1; r += 1) {
    const currentRound = roundOrder[r]
    const nextRound = roundOrder[r + 1]
    const currMatches = bracket[currentRound]
    if (!currMatches || currMatches.length < 2) {
      // If insufficient matches in current round, clear downstream rounds
      bracket[nextRound] = []
      continue
    }
    const next = buildNextRoundFromWinners(currMatches, bracket[nextRound])
    bracket[nextRound] = next
  }
}


