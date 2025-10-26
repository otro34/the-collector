# Vercel Cron Setup (Optional)

## Overview

The Collector includes scheduled automatic backup functionality. This can be triggered in two ways:

1. **Local Development**: Use the built-in node-cron scheduler (start/stop via `/settings/backup/logs`)
2. **Production (Vercel Pro/Enterprise)**: Use Vercel Cron Jobs for automatic hourly triggers

## Vercel Cron Configuration (Pro/Enterprise Plan Required)

If you have a Vercel Pro or Enterprise plan, you can enable automatic hourly backup checks by creating a `vercel.json` file in the project root:

```json
{
  "crons": [
    {
      "path": "/api/backup/scheduled",
      "schedule": "0 * * * *"
    }
  ]
}
```

This will automatically trigger the backup scheduler every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.).

## Alternative: Manual Triggering

If you're on the Vercel Hobby (free) plan, you can:

1. **Use External Cron Services**:
   - Set up a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com/)
   - Configure it to make a POST request to: `https://your-domain.com/api/backup/scheduled`
   - Set the schedule to hourly (or your preferred frequency)

2. **Manual Triggers**:
   - Visit `/settings/backup/logs` in your app
   - Click "Start Scheduler" to enable the built-in scheduler
   - The scheduler will run in-memory while your Vercel deployment is active

3. **GitHub Actions** (Coming Soon):
   - Use GitHub Actions with a scheduled workflow to trigger backups
   - No Vercel Pro plan required

## Important Notes

- The `/api/backup/scheduled` endpoint is public and can be called by any cron service
- The scheduler respects your backup settings (frequency, retention, cloud storage)
- Logs are stored in-memory and will reset when the deployment restarts
- For production use with guaranteed scheduling, we recommend:
  - Vercel Pro plan with Vercel Cron, OR
  - External cron service (free options available)

## Checking Your Vercel Plan

To check your current Vercel plan:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your account/team name in the top right
3. Select "Settings" → "Billing"
4. Your current plan is displayed at the top

## Upgrading to Vercel Pro

If you'd like to use Vercel Cron, you can upgrade to Pro:

- **Cost**: $20/month per user
- **Benefits**:
  - Cron Jobs
  - More build time
  - Team collaboration features
  - Analytics

Learn more: https://vercel.com/pricing
