import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const execAsync = promisify(exec)

// POST /api/backup/create - Create a manual backup
export async function POST() {
  try {
    // Generate timestamp for filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')
      .join('_')
      .slice(0, -5)
    const filename = `backup-${timestamp}.sql`

    // Ensure backups directory exists
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!existsSync(backupsDir)) {
      await mkdir(backupsDir, { recursive: true })
    }

    const backupPath = path.join(backupsDir, filename)

    // Get database URL from environment
    const databaseUrl = process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }

    // Parse database URL to extract connection parameters safely
    let dbParams: { host: string; port: string; database: string; user: string; password: string }
    try {
      const url = new URL(databaseUrl)
      dbParams = {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1), // Remove leading '/'
        user: url.username,
        password: url.password,
      }
    } catch (error) {
      console.error('Failed to parse database URL:', error)
      return NextResponse.json({ error: 'Invalid database URL format' }, { status: 500 })
    }

    // Get item count before backup
    const itemCount = await prisma.item.count()

    // Create database backup using pg_dump with separate parameters (prevents command injection)
    try {
      const { stderr } = await execAsync(
        `PGPASSWORD="${dbParams.password}" pg_dump -h "${dbParams.host}" -p "${dbParams.port}" -U "${dbParams.user}" -d "${dbParams.database}" -f "${backupPath}"`,
        {
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          env: { ...process.env, PGPASSWORD: dbParams.password },
        }
      )

      if (stderr && !stderr.includes('Notice:')) {
        console.error('pg_dump stderr:', stderr)
      }
    } catch (error) {
      console.error('Backup creation failed:', error)
      return NextResponse.json({ error: 'Failed to create database backup' }, { status: 500 })
    }

    // Get file size
    const { size } = await import('fs').then((fs) => fs.promises.stat(backupPath))

    // Store backup record in database
    const backupRecord = await prisma.backup.create({
      data: {
        filename,
        size,
        itemCount,
        location: backupPath,
        type: 'manual',
      },
    })

    return NextResponse.json({
      success: true,
      backup: {
        id: backupRecord.id,
        filename: backupRecord.filename,
        size: backupRecord.size,
        itemCount: backupRecord.itemCount,
        location: backupRecord.location,
        createdAt: backupRecord.createdAt,
      },
    })
  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
