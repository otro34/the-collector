# Deployment Guide

This guide covers deploying The Collector to Vercel with a PostgreSQL database.

## Prerequisites

- A Vercel account
- A PostgreSQL database (recommended options below)

## Database Setup

The application uses SQLite for local development and PostgreSQL for production deployment on Vercel.

**Important**: Before deploying to production, you must manually update `prisma/schema.prisma`:

- Change `provider = "sqlite"` to `provider = "postgresql"` in the datasource block
- Commit this change to your production branch

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Follow the prompts to create your database
6. Vercel will automatically add the `DATABASE_URL` environment variable to your project

### Option 2: Neon (Free Tier Available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string provided
4. Add it to your Vercel environment variables (see below)

### Option 3: Other PostgreSQL Providers

You can use any PostgreSQL provider:

- Supabase
- Railway
- Heroku Postgres
- AWS RDS
- Digital Ocean

## Environment Variables Setup

### Required Environment Variables for Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

```bash
# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Google Custom Search API
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# NextAuth.js
AUTH_SECRET=your-auth-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

### Important Notes

- **DATABASE_URL**: Use the connection string from your PostgreSQL provider
- **AUTH_SECRET**: Generate with `openssl rand -base64 32`
- **GitHub OAuth**: Create an OAuth App at https://github.com/settings/developers
  - Set Authorization callback URL to: `https://your-domain.vercel.app/api/auth/callback/github`

## Database Migration

After setting up your database and environment variables:

### First Deployment

1. Deploy to Vercel (it will fail initially - this is expected)
2. Run migrations from your local machine:

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:migrate:deploy
```

### Alternative: Run Migration in Vercel

You can also run migrations as a one-time command in Vercel:

1. Go to your Vercel project
2. Navigate to **Deployments**
3. Click on your latest deployment
4. Click **...** menu → **Run Command**
5. Execute: `npx prisma migrate deploy`

## Local Development

For local development, use SQLite:

1. Copy the environment file:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your credentials:

```bash
DATABASE_URL=file:./dev.db
```

3. Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

4. (Optional) Seed the database:

```bash
npm run db:seed
```

## Deployment Checklist

- [ ] PostgreSQL database created
- [ ] All environment variables set in Vercel
- [ ] Database migrations run successfully
- [ ] GitHub OAuth app created with correct callback URL
- [ ] Test the deployment by importing a CSV file

## Troubleshooting

### "Database not available" error

- Check that `DATABASE_URL` is correctly set in Vercel environment variables
- Verify the connection string format includes `?sslmode=require` for most providers
- Ensure migrations have been run on the production database

### "Prisma Client not generated" error

- Vercel should automatically run `prisma generate` via the `postinstall` script
- If issues persist, check the build logs in Vercel

### Authentication issues

- Verify `AUTH_SECRET` is set
- Check GitHub OAuth callback URL matches your deployment URL
- Ensure `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are correct

## Migration from SQLite to PostgreSQL

If you have existing data in SQLite that you want to migrate:

1. Export your data using the CSV export feature in the app
2. Set up PostgreSQL database
3. Run migrations on PostgreSQL
4. Re-import your data using the CSV import feature

## Monitoring

- Check Vercel deployment logs for any runtime errors
- Monitor database connection usage in your provider's dashboard
- Set up alerts for database connection limits

## Support

For issues related to:

- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs)
- **This app**: [GitHub Issues](https://github.com/otro34/the-collector/issues)
