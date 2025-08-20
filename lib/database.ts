import { PrismaClient } from '@prisma/client';

// Only create Prisma client if we have the required environment variables
let prisma: PrismaClient | null = null;

try {
  // Check if we're in a build context or don't have database access
  if (process.env.DATABASE_URL && 
      process.env.NEXT_PHASE !== 'phase-production-build' &&
      process.env.VERCEL_ENV !== 'production') {
    prisma = new PrismaClient();
    console.log('Database module loaded with Prisma');
  } else {
    console.log('Database module loaded - no DATABASE_URL found or build time detected, skipping database operations');
  }
} catch (error) {
  console.warn('Prisma client not available locally, skipping database operations');
}

// Database schema for tournament site
export const createTables = async () => {
  try {
    if (!prisma) {
      console.log('Skipping table creation - database not available locally or during build');
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
      console.log('Skipping database initialization - database not available locally or during build');
      return;
    }
    
    console.log('Initializing database...');
    
    // Test the connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Note: Tables need to be created manually using 'npx prisma db push'
    // This can be done locally or through Vercel's build process
    console.log('Database initialization completed - ensure tables exist with prisma db push');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Export the prisma client for use in other modules
export { prisma };
