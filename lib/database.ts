import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Database module loaded with Prisma');

// Database schema for tournament site
export const createTables = async () => {
  try {
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
