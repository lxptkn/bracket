import { PrismaClient } from '@prisma/client';

// Only create Prisma client if we have the required environment variables
let prisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
    console.log('Database module loaded with Prisma');
  } else {
    console.log('Database module loaded - no DATABASE_URL found, skipping database operations locally');
  }
} catch (error) {
  console.warn('Prisma client not available locally, skipping database operations');
}

// Database schema for tournament site
export const createTables = async () => {
  try {
    if (!prisma) {
      console.log('Skipping table creation - database not available locally');
      return;
    }
    
    console.log('Creating database tables...');
    
    // Note: With Prisma, tables are created automatically when you run migrations
    // This function is kept for compatibility but doesn't need to do anything
    console.log('Tables will be created via Prisma migrations');
    
  } catch (error) {
    console.error('Error in createTables:', error);
    throw error;
  }
};

// Initialize database on first run
export const initDatabase = async () => {
  try {
    if (!prisma) {
      console.log('Skipping database initialization - database not available locally');
      return;
    }
    
    console.log('Initializing database...');
    // Test the connection
    await prisma.$connect();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Export the prisma client for use in other modules
export { prisma };
