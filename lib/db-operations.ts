import { PrismaClient } from '@prisma/client';

// Only create Prisma client if we have the required environment variables
let prisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
  }
} catch (error) {
  console.warn('Prisma client not available locally, skipping database operations');
}

// Helper function to check if database is available
function getPrisma() {
  if (!prisma) {
    throw new Error('Database not available. Make sure DATABASE_URL is set.');
  }
  return prisma;
}

// Helper function to check if we should skip database operations
function shouldSkipDatabase() {
  // Check for build-time indicators
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ||
                      process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL;
  
  return !process.env.DATABASE_URL || isBuildTime;
}

// Helper function to safely get Prisma client
function safeGetPrisma() {
  try {
    return getPrisma();
  } catch (error) {
    console.warn('Prisma client not available:', error);
    return null;
  }
}

// Season operations
export const seasons = {
  // Get all seasons
  async getAll() {
    try {
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      const result = await client.season.findMany({
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
      if (shouldSkipDatabase()) return { month1: '', month2: '' };
      
      const client = safeGetPrisma();
      if (!client) return { month1: '', month2: '' };
      
      const result = await client.season.findUnique({
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
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    await client.season.create({
      data: { name: seasonName }
    });
  },

  // Update season months
  async updateMonths(seasonName: string, month1: string, month2: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    await client.season.update({
      where: { name: seasonName },
      data: { month1, month2 }
    });
  },

  // Delete season
  async delete(seasonName: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    await client.season.delete({
      where: { name: seasonName }
    });
  }
};

// Participant operations
export const participants = {
  // Get all participants
  async getAll() {
    try {
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      const result = await client.participant.findMany({
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
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      const result = await client.seasonParticipant.findMany({
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
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    await client.participant.create({
      data: { name, seed }
    });
  },

  // Add participant to season
  async addToSeason(participantName: string, seasonName: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    try {
      const participant = await client.participant.findUnique({
        where: { name: participantName }
      });
      
      if (!participant) {
        throw new Error(`Participant '${participantName}' not found in global participants`);
      }
      
      const season = await client.season.findUnique({
        where: { name: seasonName }
      });

      if (!season) {
        throw new Error(`Season '${seasonName}' not found`);
      }

      // Check if participant is already in this season
      const existingSeasonParticipant = await client.seasonParticipant.findFirst({
        where: {
          seasonId: season.id,
          participantId: participant.id
        }
      });

      if (existingSeasonParticipant) {
        console.log(`Participant '${participantName}' is already in season '${seasonName}'`);
        return; // Already exists, no need to add again
      }

      // Add participant to season
      await client.seasonParticipant.create({
        data: {
          seasonId: season.id,
          participantId: participant.id
        }
      });
      
      console.log(`Successfully added participant '${participantName}' to season '${seasonName}'`);
    } catch (error) {
      console.error(`Error adding participant '${participantName}' to season '${seasonName}':`, error);
      throw error;
    }
  },

  // Remove participant from season
  async removeFromSeason(participantName: string, seasonName: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    const participant = await client.participant.findUnique({
      where: { name: participantName }
    });
    const season = await client.season.findUnique({
      where: { name: seasonName }
    });

    if (participant && season) {
      await client.seasonParticipant.deleteMany({
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
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      const result = await client.moderator.findMany({
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
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      const result = await client.seasonModerator.findMany({
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
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    await client.moderator.create({
      data: { name }
    });
  },

  // Add moderator to season
  async addToSeason(moderatorName: string, seasonName: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    try {
      const moderator = await client.moderator.findUnique({
        where: { name: moderatorName }
      });
      
      if (!moderator) {
        throw new Error(`Moderator '${moderatorName}' not found in global moderators`);
      }
      
      const season = await client.season.findUnique({
        where: { name: seasonName }
      });

      if (!season) {
        throw new Error(`Season '${seasonName}' not found`);
      }

      // Check if moderator is already in this season
      const existingSeasonModerator = await client.seasonModerator.findFirst({
        where: {
          seasonId: season.id,
          moderatorId: moderator.id
        }
      });

      if (existingSeasonModerator) {
        console.log(`Moderator '${moderatorName}' is already in season '${seasonName}'`);
        return; // Already exists, no need to add again
      }

      // Add moderator to season
      await client.seasonModerator.create({
        data: {
          seasonId: season.id,
          moderatorId: moderator.id
        }
      });
      
      console.log(`Successfully added moderator '${moderatorName}' to season '${seasonName}'`);
    } catch (error) {
      console.error(`Error adding moderator '${moderatorName}' to season '${seasonName}':`, error);
      throw error;
    }
  },

  // Remove moderator from season
  async removeFromSeason(moderatorName: string, seasonName: string) {
    if (shouldSkipDatabase()) throw new Error('Database not available during build');
    
    const client = safeGetPrisma();
    if (!client) throw new Error('Database not available');
    
    const moderator = await client.moderator.findUnique({
      where: { name: moderatorName }
    });
    const season = await client.season.findUnique({
      where: { name: seasonName }
    });

    if (moderator && season) {
      await client.seasonModerator.deleteMany({
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
      if (shouldSkipDatabase()) return {};
      
      const client = safeGetPrisma();
      if (!client) return {};
      
      console.log(`Fetching bracket for season: ${seasonName}`);
      
      const result = await client.bracket.findMany({
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

      console.log(`Found ${result.length} bracket entries:`, result);

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
        console.log(`Processing round ${row.round} -> ${name}, match ${row.matchNumber}`);
        if (!bracket[name]) bracket[name] = []
        bracket[name].push({
          matchNumber: row.matchNumber,
          player1: { name: row.player1?.name || '' },
          player2: { name: row.player2?.name || '' },
          winner: row.winner?.name || undefined,
        })
      }

      console.log('Final bracket structure:', bracket);
      return bracket
    } catch (error) {
      console.error('Error fetching bracket:', error);
      return {};
    }
  },

  // Generate bracket for a season
  async generateForSeason(seasonName: string) {
    try {
      if (shouldSkipDatabase()) return [];
      
      const client = safeGetPrisma();
      if (!client) return [];
      
      console.log(`Starting bracket generation for season: ${seasonName}`);
      
      // Get season participants
      const seasonParticipants = await participants.getForSeason(seasonName);
      console.log(`Found ${seasonParticipants.length} participants for season:`, seasonParticipants);
      
      if (!Array.isArray(seasonParticipants) || seasonParticipants.length === 0) {
        console.error('No participants found for season:', seasonName);
        return [];
      }
      
      const season = await client.season.findUnique({
        where: { name: seasonName }
      });

      if (!season) {
        console.error('Season not found:', seasonName);
        return [];
      }

      console.log(`Season found with ID: ${season.id}`);

      // Clear existing bracket
      console.log('Clearing existing bracket...');
      const deletedBrackets = await client.bracket.deleteMany({
        where: { seasonId: season.id }
      });
      console.log(`Deleted ${deletedBrackets.count} existing bracket entries`);

      // Generate first round matches
      const matches = [];
      console.log('Generating first round matches...');
      
      for (let i = 0; i < seasonParticipants.length; i += 2) {
        if (i + 1 < seasonParticipants.length) {
          matches.push({
            player1: seasonParticipants[i].name,
            player2: seasonParticipants[i + 1].name,
            winner: ''
          });
          console.log(`Match ${Math.floor(i/2) + 1}: ${seasonParticipants[i].name} vs ${seasonParticipants[i + 1].name}`);
        } else {
          // Bye for odd participant
          matches.push({
            player1: seasonParticipants[i].name,
            player2: '',
            winner: seasonParticipants[i].name
          });
          console.log(`Match ${Math.floor(i/2) + 1}: ${seasonParticipants[i].name} gets a bye`);
        }
      }

      console.log(`Generated ${matches.length} matches`);

      // Save to database
      console.log('Saving matches to database...');
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        console.log(`Saving match ${i + 1}: ${match.player1} vs ${match.player2}`);
        
        const player1 = await client.participant.findUnique({
          where: { name: match.player1 }
        });
        
        if (!player1) {
          console.error(`Player 1 not found: ${match.player1}`);
          continue;
        }
        
        const player2 = match.player2 ? await client.participant.findUnique({
          where: { name: match.player2 }
        }) : null;
        
        const winner = match.winner ? await client.participant.findUnique({
          where: { name: match.winner }
        }) : null;

        const bracketEntry = await client.bracket.create({
          data: {
            seasonId: season.id,
            round: 1,
            matchNumber: i + 1,
            player1Id: player1.id,
            player2Id: player2?.id || null,
            winnerId: winner?.id || null
          }
        });
        
        console.log(`Created bracket entry with ID: ${bracketEntry.id}`);
      }

      console.log('Bracket generation completed successfully');
      return matches;
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  },

  // Set winner for a specific match
  async setWinner(seasonName: string, round: number, matchNumber: number, winnerName: string) {
    try {
      if (shouldSkipDatabase()) throw new Error('Database not available during build');
      
      const client = safeGetPrisma();
      if (!client) throw new Error('Database not available');
      
      const season = await client.season.findUnique({
        where: { name: seasonName }
      });
      
      if (!season) {
        throw new Error('Season not found');
      }

      const winner = winnerName ? await client.participant.findUnique({
        where: { name: winnerName }
      }) : null;

      await client.bracket.updateMany({
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
