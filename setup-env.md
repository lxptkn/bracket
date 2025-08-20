# Environment Setup Guide

## Local Development

To run this project locally, you need to create a `.env` file in your project root with the following content:

```bash
# Database connection string for Prisma
DATABASE_URL="postgres://ce0e195302eff81024c4c392cc44d52e2fe03e92f6b880b569753c44b1f4d992:sk_zp3g8DqaRpFZ4Dk1IGzOK@db.prisma.io:5432/?sslmode=require"
```

## Vercel Deployment

Your Vercel project already has the correct environment variables set up:

- `DATABASE_URL` - The Prisma Accelerate connection string
- `POSTGRES_URL` - The direct connection string (for compatibility)
- `PRISMA_DATABASE_URL` - The Prisma Accelerate connection string

## Database Setup

After setting up the environment variables, run:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push
```

## What Changed

1. **Switched from Vercel Postgres client to Prisma** - This resolves the connection string issues
2. **Updated database operations** - All database queries now use Prisma ORM
3. **Fixed TypeScript errors** - Added proper type safety with Prisma
4. **Maintained API compatibility** - Your existing API endpoints will work the same way

## Benefits of Prisma

- **Better connection handling** - Works with Prisma Accelerate
- **Type safety** - Full TypeScript support
- **Automatic migrations** - Database schema management
- **Better performance** - Connection pooling and query optimization
