# Self-Hosting Guide

This guide walks you through running your own instance of The Collector from your own repository. By the end, you'll have a fully functional collection management app running on Vercel with your own database.

## Overview

What you'll set up:

1. **Fork the repository** to your GitHub account
2. **Create a PostgreSQL database** (free tier available)
3. **Set up GitHub OAuth** for authentication
4. **Deploy to Vercel** (free tier available)
5. **Configure external APIs** (optional, for metadata lookup)

**Estimated time**: 30-45 minutes

## Prerequisites

- A GitHub account
- A Vercel account (free tier works fine)
- Basic familiarity with Git and command line

## Step 1: Fork the Repository

1. Go to the original repository: [https://github.com/otro34/the-collector](https://github.com/otro34/the-collector)

2. Click the **"Fork"** button in the top-right corner

3. Select your GitHub account as the destination

4. Wait for the fork to complete

5. Clone your forked repository locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/the-collector.git
   cd the-collector
   ```

6. Install dependencies:

   ```bash
   npm install
   ```

## Step 2: Set Up PostgreSQL Database

The app uses SQLite for local development and PostgreSQL for production. Choose one of the following providers:

### Option A: Vercel Postgres (Recommended)

Vercel Postgres integrates seamlessly with your deployment:

1. Skip this step for now - you'll set it up after connecting to Vercel (Step 4)

### Option B: Neon (Free Tier)

[Neon](https://neon.tech) offers a generous free tier:

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g., "the-collector")
3. Copy the connection string from the dashboard
4. Save it for later - you'll need it in Step 5

### Option C: Supabase

[Supabase](https://supabase.com) provides PostgreSQL with additional features:

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database** → **Connection string**
4. Copy the "URI" connection string
5. Save it for later

### Option D: Railway

[Railway](https://railway.app) offers simple database hosting:

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add a **PostgreSQL** database
4. Copy the connection URL from the database settings
5. Save it for later

## Step 3: Create GitHub OAuth Application

You need a GitHub OAuth app for user authentication. Create **two apps** - one for development and one for production.

### For Local Development

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)

2. Click **"OAuth Apps"** → **"New OAuth App"**

3. Fill in the details:
   - **Application name**: `The Collector - Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

4. Click **"Register application"**

5. Copy the **Client ID**

6. Click **"Generate a new client secret"** and copy it

7. Save both values securely

### For Production

1. Create another OAuth App with:
   - **Application name**: `The Collector`
   - **Homepage URL**: `https://your-app-name.vercel.app` (update after deployment)
   - **Authorization callback URL**: `https://your-app-name.vercel.app/api/auth/callback/github`

2. Save the Client ID and Client Secret

> **Note**: You'll update the production URLs after your first Vercel deployment.

## Step 4: Deploy to Vercel

### Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New..."** → **"Project"**

3. Find and select your forked `the-collector` repository

4. Click **"Import"**

### Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: (leave default)
- **Install Command**: `npm install`

### Set Up Vercel Postgres (if using Option A)

1. Before deploying, click **"Storage"** in the Vercel dashboard
2. Click **"Create Database"** → **"Postgres"**
3. Follow the prompts to create your database
4. Vercel automatically adds `DATABASE_URL` to your project

### Deploy

1. Click **"Deploy"**

2. The first deployment will fail - this is expected (we haven't set up environment variables yet)

3. Note your deployment URL (e.g., `https://the-collector-abc123.vercel.app`)

4. **Important**: Go back to your **production** GitHub OAuth App and update:
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`

## Step 5: Configure Environment Variables

### Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Save the output.

### Add Variables to Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**

2. Add the following variables:

| Variable                  | Value                                                             | Required |
| ------------------------- | ----------------------------------------------------------------- | -------- |
| `DATABASE_URL`            | Your PostgreSQL connection string (skip if using Vercel Postgres) | Yes      |
| `AUTH_SECRET`             | The secret you generated above                                    | Yes      |
| `AUTH_GITHUB_ID`          | Your **production** GitHub OAuth Client ID                        | Yes      |
| `AUTH_GITHUB_SECRET`      | Your **production** GitHub OAuth Client Secret                    | Yes      |
| `GOOGLE_API_KEY`          | Google Custom Search API key                                      | No       |
| `GOOGLE_SEARCH_ENGINE_ID` | Google Programmable Search Engine ID                              | No       |
| `DISCOGS_TOKEN`           | Discogs API token for music lookup                                | No       |
| `RAWG_API_KEY`            | RAWG API key for videogame lookup                                 | No       |

3. Make sure each variable is enabled for **Production** environment

4. Click **"Save"**

## Step 6: Update Prisma Schema for PostgreSQL

Before running migrations, you need to update the database provider:

1. Open `prisma/schema.prisma` in your local repository

2. Find the `datasource db` block and change `sqlite` to `postgresql`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Commit and push this change:

   ```bash
   git add prisma/schema.prisma
   git commit -m "Switch to PostgreSQL for production"
   git push
   ```

## Step 7: Run Database Migrations

### Option A: From Vercel Dashboard

1. Go to your Vercel project → **Deployments**
2. Click on your latest deployment
3. Click the **"..."** menu → **"Run Command"**
4. Execute: `npx prisma migrate deploy`

### Option B: From Local Machine

1. Copy your production `DATABASE_URL` from Vercel

2. Run migrations:

   ```bash
   DATABASE_URL="your-production-database-url" npx prisma migrate deploy
   ```

## Step 8: Redeploy

1. Go to your Vercel project → **Deployments**

2. Click **"..."** on the latest deployment → **"Redeploy"**

3. Wait for the deployment to complete

4. Visit your app URL - you should see the sign-in page!

## Step 9: First Sign-In

1. Click **"Sign in with GitHub"**

2. Authorize the application

3. The first user to sign in automatically becomes an **Admin**

4. You now have full access to the application!

## Step 10: Set Up Local Development (Optional)

For local development with your fork:

1. Create a `.env.local` file:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local`:

   ```env
   # Local SQLite database
   DATABASE_URL="file:./dev.db"

   # Auth (use your DEVELOPMENT OAuth app)
   AUTH_SECRET="generate-a-local-secret"
   AUTH_GITHUB_ID="your-dev-github-client-id"
   AUTH_GITHUB_SECRET="your-dev-github-client-secret"

   # Optional APIs
   GOOGLE_API_KEY="your-google-api-key"
   GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
   DISCOGS_TOKEN="your-discogs-token"
   RAWG_API_KEY="your-rawg-api-key"
   ```

3. **Important**: Revert Prisma to SQLite for local development:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   > **Tip**: You can maintain two schema files or use a script to switch between them.

4. Set up the local database:

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Optional: Set Up External APIs

These APIs enhance the app with metadata lookup features but are not required.

### RAWG API (Video Game Metadata)

1. Go to [rawg.io/apidocs](https://rawg.io/apidocs)
2. Sign up for a free account
3. Get your API key from your dashboard
4. Add `RAWG_API_KEY` to Vercel environment variables

### Discogs API (Music Metadata)

1. Go to [discogs.com/developers](https://www.discogs.com/developers)
2. Create an account and generate a personal access token
3. Add `DISCOGS_TOKEN` to Vercel environment variables

### Google Custom Search (Cover Images)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Custom Search API**
4. Create API credentials and get your API key
5. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
6. Create a new search engine configured for image search
7. Get your Search Engine ID
8. Add both `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` to Vercel

## Keeping Your Fork Updated

To get updates from the original repository:

1. Add the original repo as an upstream remote:

   ```bash
   git remote add upstream https://github.com/otro34/the-collector.git
   ```

2. Fetch and merge updates:

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

3. Resolve any conflicts and push:

   ```bash
   git push origin main
   ```

4. Vercel will automatically redeploy

## Troubleshooting

### "Database connection failed"

- Verify your `DATABASE_URL` is correct in Vercel
- Ensure the connection string includes `?sslmode=require`
- Check that migrations have been run

### "Invalid client credentials" (OAuth)

- Verify `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are correct
- Ensure you're using the production OAuth app, not development
- Check for extra spaces in environment variables

### "Callback URL mismatch"

- Update your GitHub OAuth app's callback URL to match your Vercel URL
- Format: `https://your-app.vercel.app/api/auth/callback/github`

### Build fails with Prisma errors

- Ensure `prisma/schema.prisma` uses `postgresql` provider
- Run `npm run db:generate` locally and commit the changes
- Check that `postinstall` script runs `prisma generate`

### First user isn't admin

- The first user to sign in should automatically become admin
- Check the `User` table in your database
- You can manually update the role via Prisma Studio:

  ```bash
  DATABASE_URL="your-db-url" npx prisma studio
  ```

## Customization Ideas

Once your instance is running, consider:

- **Custom domain**: Add a custom domain in Vercel settings
- **Branding**: Update logos and colors in the UI
- **Additional OAuth**: Add Google, Discord, or other providers
- **Backup schedule**: Configure automated cloud backups
- **Import your data**: Use the CSV import feature to migrate existing collections

## Support

- **App issues**: [GitHub Issues](https://github.com/otro34/the-collector/issues)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs)
- **NextAuth**: [Auth.js Documentation](https://authjs.dev/)

---

Congratulations! You now have your own instance of The Collector. Happy collecting! 🎮 📚 🎵
