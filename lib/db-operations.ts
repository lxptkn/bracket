import { sql } from '@vercel/postgres';

// Season operations
export const seasons = {
  // Get all seasons
  async getAll() {
    try {
      const result = await sql`
        SELECT id, name, month1, month2 
        FROM seasons 
        ORDER BY name DESC
      `;
      return Array.isArray(result?.rows) ? result.rows.map(row => row.name) : [];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  },

  // Get season metadata
  async getMetadata(seasonName: string) {
    try {
      const result = await sql`
        SELECT month1, month2 
        FROM seasons 
        WHERE name = ${seasonName}
      `;
      return result.rows[0] || { month1: '', month2: '' };
    } catch (error) {
      console.error('Error fetching season metadata:', error);
      return { month1: '', month2: '' };
    }
  },

  // Create new season
  async create(seasonName: string) {
    await sql`
      INSERT INTO seasons (name) 
      VALUES (${seasonName})
    `;
  },

  // Update season months
  async updateMonths(seasonName: string, month1: string, month2: string) {
    await sql`
      UPDATE seasons 
      SET month1 = ${month1}, month2 = ${month2}
      WHERE name = ${seasonName}
    `;
  },

  // Delete season
  async delete(seasonName: string) {
    await sql`
      DELETE FROM seasons 
      WHERE name = ${seasonName}
    `;
  }
};

// Participant operations
export const participants = {
  // Get all participants
  async getAll() {
    try {
      const result = await sql`
        SELECT id, name, seed 
        FROM participants 
        ORDER BY name
      `;
      return Array.isArray(result?.rows) ? result.rows.map(row => ({
        name: row.name,
        seed: row.seed
      })) : [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },

  // Get participants for a specific season
  async getForSeason(seasonName: string) {
    try {
      const result = await sql`
        SELECT p.id, p.name, p.seed
        FROM participants p
        JOIN season_participants sp ON p.id = sp.participant_id
        JOIN seasons s ON sp.season_id = s.id
        WHERE s.name = ${seasonName}
        ORDER BY p.name
      `;
      return Array.isArray(result?.rows) ? result.rows.map(row => ({
        name: row.name,
        seed: row.seed
      })) : [];
    } catch (error) {
      console.error('Error fetching season participants:', error);
      return [];
    }
  },

  // Add participant globally
  async add(name: string, seed?: number) {
    await sql`
      INSERT INTO participants (name, seed) 
      VALUES (${name}, ${seed || null})
    `;
  },

  // Add participant to season
  async addToSeason(participantName: string, seasonName: string) {
    // First get the participant and season IDs
    const participantResult = await sql`
      SELECT id FROM participants WHERE name = ${participantName}
    `;
    const seasonResult = await sql`
      SELECT id FROM seasons WHERE name = ${seasonName}
    `;

    if (participantResult.rows[0] && seasonResult.rows[0]) {
      await sql`
        INSERT INTO season_participants (season_id, participant_id)
        VALUES (${seasonResult.rows[0].id}, ${participantResult.rows[0].id})
        ON CONFLICT DO NOTHING
      `;
    }
  },

  // Remove participant from season
  async removeFromSeason(participantName: string, seasonName: string) {
    const participantResult = await sql`
      SELECT id FROM participants WHERE name = ${participantName}
    `;
    const seasonResult = await sql`
      SELECT id FROM seasons WHERE name = ${seasonName}
    `;

    if (participantResult.rows[0] && seasonResult.rows[0]) {
      await sql`
        DELETE FROM season_participants 
        WHERE season_id = ${seasonResult.rows[0].id} 
        AND participant_id = ${participantResult.rows[0].id}
      `;
    }
  }
};

// Moderator operations
export const moderators = {
  // Get all moderators
  async getAll() {
    try {
      const result = await sql`
        SELECT id, name 
        FROM moderators 
        ORDER BY name
      `;
      return Array.isArray(result?.rows) ? result.rows.map(row => ({ name: row.name })) : [];
    } catch (error) {
      console.error('Error fetching moderators:', error);
      return [];
    }
  },

  // Get moderators for a specific season
  async getForSeason(seasonName: string) {
    try {
      const result = await sql`
        SELECT m.id, m.name
        FROM moderators m
        JOIN season_moderators sm ON m.id = sm.moderator_id
        JOIN seasons s ON sm.season_id = s.id
        WHERE s.name = ${seasonName}
        ORDER BY m.name
      `;
      return Array.isArray(result?.rows) ? result.rows.map(row => ({ name: row.name })) : [];
    } catch (error) {
      console.error('Error fetching season moderators:', error);
      return [];
    }
  },

  // Add moderator globally
  async add(name: string) {
    await sql`
      INSERT INTO moderators (name) 
      VALUES (${name})
    `;
  },

  // Add moderator to season
  async addToSeason(moderatorName: string, seasonName: string) {
    const moderatorResult = await sql`
      SELECT id FROM moderators WHERE name = ${moderatorName}
    `;
    const seasonResult = await sql`
      SELECT id FROM seasons WHERE name = ${seasonName}
    `;

    if (moderatorResult.rows[0] && seasonResult.rows[0]) {
      await sql`
        INSERT INTO season_moderators (season_id, moderator_id)
        VALUES (${seasonResult.rows[0].id}, ${moderatorResult.rows[0].id})
        ON CONFLICT DO NOTHING
      `;
    }
  },

  // Remove moderator from season
  async removeFromSeason(moderatorName: string, seasonName: string) {
    const moderatorResult = await sql`
      SELECT id FROM moderators WHERE name = ${moderatorName}
    `;
    const seasonResult = await sql`
      SELECT id FROM seasons WHERE name = ${seasonName}
    `;

    if (moderatorResult.rows[0] && seasonResult.rows[0]) {
      await sql`
        DELETE FROM season_moderators 
        WHERE season_id = ${seasonResult.rows[0].id} 
        AND moderator_id = ${moderatorResult.rows[0].id}
      `;
    }
  }
};

// Bracket operations
export const brackets = {
  // Get bracket for a season
  async getForSeason(seasonName: string) {
    try {
      const result = await sql`
        SELECT b.round, b.match_number, 
               p1.name as player1_name, p2.name as player2_name, w.name as winner_name
        FROM brackets b
        JOIN seasons s ON b.season_id = s.id
        LEFT JOIN participants p1 ON b.player1_id = p1.id
        LEFT JOIN participants p2 ON b.player2_id = p2.id
        LEFT JOIN participants w ON b.winner_id = w.id
        WHERE s.name = ${seasonName}
        ORDER BY b.round, b.match_number
      `;

      const roundName = (roundNum: number): string => {
        switch (roundNum) {
          case 1: return 'Round 1'
          case 2: return 'Quarterfinals'
          case 3: return 'Semifinals'
          case 4: return 'Finals'
          default: return `Round ${roundNum}`
        }
      }

      const bracket: Record<string, Array<{ matchNumber: number; player1: { name: string }; player2: { name: string }; winner?: string }>> = {}

      if (Array.isArray(result?.rows)) {
        for (const row of result.rows) {
          const name = roundName(Number(row.round))
          if (!bracket[name]) bracket[name] = []
          bracket[name].push({
            matchNumber: Number(row.match_number),
            player1: { name: row.player1_name || '' },
            player2: { name: row.player2_name || '' },
            winner: row.winner_name || undefined,
          })
        }
      }

      return bracket
    } catch (error) {
      console.error('Error fetching bracket:', error);
      return {};
    }
  },

  // Generate bracket for a season
  async generateForSeason(seasonName: string) {
    try {
      // Get season participants
      const seasonParticipants = await participants.getForSeason(seasonName);
      
      if (!Array.isArray(seasonParticipants) || seasonParticipants.length === 0) {
        console.error('No participants found for season:', seasonName);
        return [];
      }
      
      // Clear existing bracket
      const seasonResult = await sql`
        SELECT id FROM seasons WHERE name = ${seasonName}
      `;
      if (seasonResult.rows[0]) {
        await sql`
          DELETE FROM brackets WHERE season_id = ${seasonResult.rows[0].id}
        `;
      }

      // Generate first round matches
      const matches = [];
      for (let i = 0; i < seasonParticipants.length; i += 2) {
        if (i + 1 < seasonParticipants.length) {
          matches.push({
            player1: seasonParticipants[i].name,
            player2: seasonParticipants[i + 1].name,
            winner: ''
          });
        } else {
          // Bye for odd participant
          matches.push({
            player1: seasonParticipants[i].name,
            player2: '',
            winner: seasonParticipants[i].name
          });
        }
      }

      // Save to database
      if (seasonResult.rows[0]) {
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const player1Result = await sql`
            SELECT id FROM participants WHERE name = ${match.player1}
          `;
          const player2Result = match.player2 ? await sql`
            SELECT id FROM participants WHERE name = ${match.player2}
          ` : null;
          const winnerResult = match.winner ? await sql`
            SELECT id FROM participants WHERE name = ${match.winner}
          ` : null;

          await sql`
            INSERT INTO brackets (season_id, round, match_number, player1_id, player2_id, winner_id)
            VALUES (
              ${seasonResult.rows[0].id}, 
              1, 
              ${i + 1}, 
              ${player1Result.rows[0]?.id || null}, 
              ${player2Result?.rows[0]?.id || null}, 
              ${winnerResult?.rows[0]?.id || null}
            )
          `;
        }
      }

      return matches;
    } catch (error) {
      console.error('Error generating bracket:', error);
      return [];
    }
  },

  // Set winner for a specific match
  async setWinner(seasonName: string, round: number, matchNumber: number, winnerName: string) {
    try {
      const seasonResult = await sql`
        SELECT id FROM seasons WHERE name = ${seasonName}
      `;
      if (!seasonResult.rows[0]) {
        throw new Error('Season not found');
      }
      const winnerResult = winnerName ? await sql`
        SELECT id FROM participants WHERE name = ${winnerName}
      ` : null;

      await sql`
        UPDATE brackets 
        SET winner_id = ${winnerResult?.rows[0]?.id || null}
        WHERE season_id = ${seasonResult.rows[0].id} 
        AND round = ${round} 
        AND match_number = ${matchNumber}
      `;
    } catch (error) {
      console.error('Error setting winner:', error);
      throw error;
    }
  }
};
