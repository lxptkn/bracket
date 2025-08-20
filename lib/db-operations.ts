import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Season operations
export const seasons = {
  // Get all seasons
  async getAll() {
    try {
      const result = await prisma.season.findMany({
        select: { name: true },
        orderBy: { name: 'desc' }
      });
      return result.map(row => row.name);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  },

  // Get season metadata
  async getMetadata(seasonName: string) {
    try {
      const result = await prisma.season.findUnique({
        where: { name: seasonName },
        select: { month1: true, month2: true }
      });
      return result || { month1: '', month2: '' };
    } catch (error) {
      console.error('Error fetching season metadata:', error);
      return { month1: '', month2: '' };
    }
  },

  // Create new season
  async create(seasonName: string) {
    await prisma.season.create({
      data: { name: seasonName }
    });
  },

  // Update season months
  async updateMonths(seasonName: string, month1: string, month2: string) {
    await prisma.season.update({
      where: { name: seasonName },
      data: { month1, month2 }
    });
  },

  // Delete season
  async delete(seasonName: string) {
    await prisma.season.delete({
      where: { name: seasonName }
    });
  }
};

// Participant operations
export const participants = {
  // Get all participants
  async getAll() {
    try {
      const result = await prisma.participant.findMany({
        select: { name: true, seed: true },
        orderBy: { name: 'asc' }
      });
      return result;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },

  // Get participants for a specific season
  async getForSeason(seasonName: string) {
    try {
      const result = await prisma.seasonParticipant.findMany({
        where: { season: { name: seasonName } },
        select: {
          participant: {
            select: { name: true, seed: true }
          }
        },
        orderBy: { participant: { name: 'asc' } }
      });
      return result.map(row => row.participant);
    } catch (error) {
      console.error('Error fetching season participants:', error);
      return [];
    }
  },

  // Add participant globally
  async add(name: string, seed?: number) {
    await prisma.participant.create({
      data: { name, seed }
    });
  },

  // Add participant to season
  async addToSeason(participantName: string, seasonName: string) {
    const participant = await prisma.participant.findUnique({
      where: { name: participantName }
    });
    const season = await prisma.season.findUnique({
      where: { name: seasonName }
    });

    if (participant && season) {
      await prisma.seasonParticipant.create({
        data: {
          seasonId: season.id,
          participantId: participant.id
        }
      });
    }
  },

  // Remove participant from season
  async removeFromSeason(participantName: string, seasonName: string) {
    const participant = await prisma.participant.findUnique({
      where: { name: participantName }
    });
    const season = await prisma.season.findUnique({
      where: { name: seasonName }
    });

    if (participant && season) {
      await prisma.seasonParticipant.deleteMany({
        where: {
          seasonId: season.id,
          participantId: participant.id
        }
      });
    }
  }
};

// Moderator operations
export const moderators = {
  // Get all moderators
  async getAll() {
    try {
      const result = await prisma.moderator.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
      });
      return result;
    } catch (error) {
      console.error('Error fetching moderators:', error);
      return [];
    }
  },

  // Get moderators for a specific season
  async getForSeason(seasonName: string) {
    try {
      const result = await prisma.seasonModerator.findMany({
        where: { season: { name: seasonName } },
        select: {
          moderator: {
            select: { name: true }
          }
        },
        orderBy: { moderator: { name: 'asc' } }
      });
      return result.map(row => row.moderator);
    } catch (error) {
      console.error('Error fetching season moderators:', error);
      return [];
    }
  },

  // Add moderator globally
  async add(name: string) {
    await prisma.moderator.create({
      data: { name }
    });
  },

  // Add moderator to season
  async addToSeason(moderatorName: string, seasonName: string) {
    const moderator = await prisma.moderator.findUnique({
      where: { name: moderatorName }
    });
    const season = await prisma.season.findUnique({
      where: { name: seasonName }
    });

    if (moderator && season) {
      await prisma.seasonModerator.create({
        data: {
          seasonId: season.id,
          moderatorId: moderator.id
        }
      });
    }
  },

  // Remove moderator from season
  async removeFromSeason(moderatorName: string, seasonName: string) {
    const moderator = await prisma.moderator.findUnique({
      where: { name: moderatorName }
    });
    const season = await prisma.season.findUnique({
      where: { name: seasonName }
    });

    if (moderator && season) {
      await prisma.seasonModerator.deleteMany({
        where: {
          seasonId: season.id,
          moderatorId: moderator.id
        }
      });
    }
  }
};

// Bracket operations
export const brackets = {
  // Get bracket for a season
  async getForSeason(seasonName: string) {
    try {
      const result = await prisma.bracket.findMany({
        where: { season: { name: seasonName } },
        select: {
          round: true,
          matchNumber: true,
          player1: { select: { name: true } },
          player2: { select: { name: true } },
          winner: { select: { name: true } }
        },
        orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }]
      });

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

      for (const row of result) {
        const name = roundName(row.round)
        if (!bracket[name]) bracket[name] = []
        bracket[name].push({
          matchNumber: row.matchNumber,
          player1: { name: row.player1?.name || '' },
          player2: { name: row.player2?.name || '' },
          winner: row.winner?.name || undefined,
        })
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
      
      const season = await prisma.season.findUnique({
        where: { name: seasonName }
      });

      if (!season) {
        console.error('Season not found:', seasonName);
        return [];
      }

      // Clear existing bracket
      await prisma.bracket.deleteMany({
        where: { seasonId: season.id }
      });

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
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const player1 = await prisma.participant.findUnique({
          where: { name: match.player1 }
        });
        const player2 = match.player2 ? await prisma.participant.findUnique({
          where: { name: match.player2 }
        }) : null;
        const winner = match.winner ? await prisma.participant.findUnique({
          where: { name: match.winner }
        }) : null;

        await prisma.bracket.create({
          data: {
            seasonId: season.id,
            round: 1,
            matchNumber: i + 1,
            player1Id: player1?.id || null,
            player2Id: player2?.id || null,
            winnerId: winner?.id || null
          }
        });
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
      const season = await prisma.season.findUnique({
        where: { name: seasonName }
      });
      
      if (!season) {
        throw new Error('Season not found');
      }

      const winner = winnerName ? await prisma.participant.findUnique({
        where: { name: winnerName }
      }) : null;

      await prisma.bracket.updateMany({
        where: {
          seasonId: season.id,
          round: round,
          matchNumber: matchNumber
        },
        data: {
          winnerId: winner?.id || null
        }
      });
    } catch (error) {
      console.error('Error setting winner:', error);
      throw error;
    }
  }
};
