# Environment Setup Guide

## Local Development

**You don't need to set up any environment variables locally!** 

The code is now designed to work gracefully without a database connection when running locally. It will:
- Show empty lists/arrays for data
- Skip database operations
- Work perfectly for UI development and testing

## Vercel Deployment

Your Vercel project already has the correct environment variables set up:

- `DATABASE_URL` - The Prisma Accelerate connection string
- `POSTGRES_URL` - The direct connection string (for compatibility)
- `PRISMA_DATABASE_URL` - The Prisma Accelerate connection string

## How It Works

1. **Locally**: No database connection needed - code runs in "offline mode"
2. **On Vercel**: Full database functionality with Prisma Accelerate
3. **Automatic**: The code detects the environment and adapts accordingly

## What Changed

1. **Switched from Vercel Postgres client to Prisma** - This resolves the connection string issues
2. **Added graceful fallbacks** - Code works locally without database
3. **Updated database operations** - All database queries now use Prisma ORM
4. **Fixed TypeScript errors** - Added proper type safety with Prisma
5. **Maintained API compatibility** - Your existing API endpoints will work the same way

## Benefits

- **No local setup required** - Just run `npm run dev` and it works
- **Better connection handling** - Works with Prisma Accelerate on Vercel
- **Type safety** - Full TypeScript support
- **Automatic migrations** - Database schema management
- **Better performance** - Connection pooling and query optimization

## Testing Locally

You can now:
- ✅ Run the development server
- ✅ Navigate through the UI
- ✅ Test component rendering
- ✅ See the interface (with empty data)
- ❌ Database operations will be skipped locally

## Testing on Vercel

When you deploy to Vercel:
- ✅ Full database functionality
- ✅ Create/edit/delete seasons, participants, moderators
- ✅ Generate brackets
- ✅ All features work as expected
