import { sql } from '@vercel/postgres';

// Database schema for tournament site
export const createTables = async () => {
  try {
    // Create seasons table
    await sql`
      CREATE TABLE IF NOT EXISTS seasons (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        month1 VARCHAR(7),
        month2 VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create participants table
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        seed INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create season_participants table (many-to-many relationship)
    await sql`
      CREATE TABLE IF NOT EXISTS season_participants (
        id SERIAL PRIMARY KEY,
        season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(season_id, participant_id)
      )
    `;

    // Create moderators table
    await sql`
      CREATE TABLE IF NOT EXISTS moderators (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create season_moderators table (many-to-many relationship)
    await sql`
      CREATE TABLE IF NOT EXISTS season_moderators (
        id SERIAL PRIMARY KEY,
        season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
        moderator_id INTEGER REFERENCES moderators(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(season_id, moderator_id)
      )
    `;

    // Create brackets table
    await sql`
      CREATE TABLE IF NOT EXISTS brackets (
        id SERIAL PRIMARY KEY,
        season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
        round INTEGER NOT NULL,
        match_number INTEGER NOT NULL,
        player1_id INTEGER REFERENCES participants(id),
        player2_id INTEGER REFERENCES participants(id),
        winner_id INTEGER REFERENCES participants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(season_id, round, match_number)
      )
    `;

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Initialize database on first run
export const initDatabase = async () => {
  try {
    await createTables();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
