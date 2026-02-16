# GitHub Authentication Setup Guide

This application now uses NextAuth.js (Auth.js v5) with GitHub OAuth for authentication. Follow these steps to set up authentication for your deployment.

## Prerequisites

- A GitHub account
- Access to your Vercel deployment settings (if deploying to Vercel)

## Step 1: Create a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button
4. Fill in the application details:

   **For Local Development:**
   - **Application name**: `The Collector - Development` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

   **For Production (Vercel):**
   - **Application name**: `The Collector` (or any name you prefer)
   - **Homepage URL**: `https://your-app-name.vercel.app`
   - **Authorization callback URL**: `https://your-app-name.vercel.app/api/auth/callback/github`

   > **Note**: You'll need to create **two separate OAuth Apps** - one for development and one for production.

5. Click **"Register application"**
6. After creation, you'll see your **Client ID**
7. Click **"Generate a new client secret"** to get your **Client Secret**
8. **Save both values** - you'll need them in the next step

## Step 2: Configure Environment Variables

### Local Development

1. Copy the `.env.example` file to create a `.env.local` file:

   ```bash
   cp .env.example .env.local
   ```

2. Generate an AUTH_SECRET:

   ```bash
   openssl rand -base64 32
   ```

3. Update your `.env.local` file with the following:

   ```env
   # NextAuth.js
   AUTH_SECRET="your-generated-secret-from-step-2"

   # GitHub OAuth (use your Development OAuth App credentials)
   AUTH_GITHUB_ID="your-github-client-id"
   AUTH_GITHUB_SECRET="your-github-client-secret"
   ```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   | Name                 | Value                                              |
   | -------------------- | -------------------------------------------------- |
   | `AUTH_SECRET`        | Generate using `openssl rand -base64 32`           |
   | `AUTH_GITHUB_ID`     | Your **Production** GitHub OAuth App Client ID     |
   | `AUTH_GITHUB_SECRET` | Your **Production** GitHub OAuth App Client Secret |

4. Make sure to select the appropriate environment (Production, Preview, Development)
5. Click **"Save"**
6. Redeploy your application for the changes to take effect

## Step 3: Test Authentication

### Local Development

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Click **"Sign in with GitHub"**
5. Authorize the application
6. You should be redirected back to the home page

### Production

1. Visit your deployed application URL
2. You should be redirected to the sign-in page
3. Click **"Sign in with GitHub"**
4. Authorize the application
5. You should be redirected back to the home page

## How Authentication Works

- **All routes are protected by default** except for:
  - `/auth/signin` - Sign-in page
  - `/api/auth/*` - Authentication API routes
  - Static assets and images

- **Middleware** (`src/middleware.ts`) handles authentication checks
- **Unauthorized users** are automatically redirected to `/auth/signin`
- **After sign-in**, users are redirected to their original destination

## User Menu

- The user menu appears in the top-right corner of the header
- Shows the user's GitHub avatar and name
- Provides access to:
  - User profile (coming soon)
  - Sign out functionality

## Troubleshooting

### "Error: Missing AUTH_SECRET"

- Make sure you've generated and set the `AUTH_SECRET` environment variable
- Restart your development server after updating `.env.local`

### "Error: Invalid client credentials"

- Double-check your `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
- Ensure you're using the correct OAuth App (development vs. production)
- Make sure there are no extra spaces in your environment variables

### "Callback URL mismatch"

- Verify that the Authorization callback URL in your GitHub OAuth App matches:
  - Local: `http://localhost:3000/api/auth/callback/github`
  - Production: `https://your-domain.vercel.app/api/auth/callback/github`

### Can't sign out

- Clear your browser cookies
- Check that the `AUTH_SECRET` is set correctly

## Additional Configuration

### Adding More OAuth Providers

NextAuth.js supports many OAuth providers. To add more (e.g., Google, Discord):

1. Add the provider package if needed
2. Update `src/auth.ts` to include the new provider
3. Add the necessary environment variables
4. Update the sign-in page to include the new provider button

### Customizing the Sign-in Page

The sign-in page is located at `src/app/auth/signin/page.tsx`. You can customize:

- Page layout and styling
- Additional sign-in options
- Terms and conditions text
- Branding and logos

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files to version control
2. **Rotate your secrets** regularly
3. **Use different OAuth Apps** for development and production
4. **Keep dependencies updated** for security patches
5. **Review GitHub OAuth permissions** to ensure you only request what's needed

## Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
