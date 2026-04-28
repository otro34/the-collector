/* eslint-disable no-console */
/**
 * Migrate existing item cover images from external URLs to S3/CloudFront.
 *
 * For each item whose coverUrl is not already a CloudFront URL:
 *   1. Download the image from the existing URL
 *   2. Upload it to S3
 *   3. Update the DB record with the new CloudFront URL
 *
 * Safe to run multiple times (idempotent — skips already-migrated items).
 *
 * Usage:
 *   npx tsx scripts/migrate-images.ts [--dry-run]
 *
 * Requires env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *                    AWS_S3_BUCKET, CLOUDFRONT_URL
 */

import { prisma } from '../src/lib/db'
import { isImageUploadConfigured, uploadImageFromUrl } from '../src/lib/image-upload'

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  if (!isImageUploadConfigured()) {
    console.error(
      '❌  S3 not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, and CLOUDFRONT_URL.'
    )
    process.exit(1)
  }

  const cloudfrontBase = process.env.CLOUDFRONT_URL!.replace(/\/$/, '')

  const items = await prisma.item.findMany({
    where: {
      coverUrl: {
        not: null,
      },
    },
    select: { id: true, title: true, coverUrl: true },
  })

  const toMigrate = items.filter(
    (item) => item.coverUrl && !item.coverUrl.startsWith(cloudfrontBase)
  )

  console.log(`Found ${items.length} items with cover images.`)
  console.log(`${toMigrate.length} need migration.`)
  if (DRY_RUN) console.log('(dry-run mode — no changes will be made)')
  console.log()

  let succeeded = 0
  let failed = 0
  let skipped = 0

  for (const item of toMigrate) {
    const url = item.coverUrl!
    try {
      if (DRY_RUN) {
        console.log(`  [dry-run] Would migrate: "${item.title}" — ${url}`)
        skipped++
        continue
      }

      const newUrl = await uploadImageFromUrl(url)
      await prisma.item.update({
        where: { id: item.id },
        data: { coverUrl: newUrl },
      })
      console.log(`  ✅  "${item.title}" → ${newUrl}`)
      succeeded++
    } catch (err) {
      console.error(`  ❌  "${item.title}" (${url}): ${err instanceof Error ? err.message : err}`)
      failed++
    }
  }

  console.log()
  if (DRY_RUN) {
    console.log(`Done (dry-run). ${skipped} items would be migrated.`)
  } else {
    console.log(
      `Done. ✅ ${succeeded} migrated  ❌ ${failed} failed  ⏭ ${items.length - toMigrate.length} already on CloudFront`
    )
  }
}

main()
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
