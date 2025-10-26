import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const execAsync = promisify(exec)

type RouteContext = {
  params: Promise<{ id: string }>
}

// POST /api/backup/[id]/restore - Restore database from backup
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    // Verify backup exists
    const backup = await prisma.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Get database URL from environment
    const databaseUrl = process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }

    // Parse database URL to extract connection parameters
    let dbParams: { host: string; port: string; database: string; user: string; password: string }
    try {
      const url = new URL(databaseUrl)
      dbParams = {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
      }
    } catch (error) {
      console.error('Failed to parse database URL:', error)
      return NextResponse.json({ error: 'Invalid database URL format' }, { status: 500 })
    }

    // Step 1: Create a safety backup before restoring
    const safetyTimestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')
      .join('_')
      .slice(0, -5)
    const safetyFilename = `backup-safety-${safetyTimestamp}.sql`

    const backupsDir = path.join(process.cwd(), 'backups')
    if (!existsSync(backupsDir)) {
      await mkdir(backupsDir, { recursive: true })
    }

    const safetyBackupPath = path.join(backupsDir, safetyFilename)

    try {
      const itemCount = await prisma.item.count()

      await execAsync(
        `PGPASSWORD="${dbParams.password}" pg_dump -h "${dbParams.host}" -p "${dbParams.port}" -U "${dbParams.user}" -d "${dbParams.database}" -f "${safetyBackupPath}"`,
        {
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          env: { ...process.env, PGPASSWORD: dbParams.password },
        }
      )

      const { size } = await import('fs').then((fs) => fs.promises.stat(safetyBackupPath))

      await prisma.backup.create({
        data: {
          filename: safetyFilename,
          size,
          itemCount,
          location: safetyBackupPath,
          type: 'safety',
        },
      })
    } catch (error) {
      console.error('Failed to create safety backup:', error)
      return NextResponse.json(
        {
          error: 'Failed to create safety backup before restore',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Step 2: Download backup file from cloud if needed
    let backupFilePath = backup.location

    if (backup.location.startsWith('https://') || backup.location.startsWith('dropbox:')) {
      try {
        // Download the backup file from cloud storage
        const response = await fetch(`/api/backup/${id}/download`, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to download backup from cloud')
        }

        const backupContent = await response.text()
        const tempBackupPath = path.join(backupsDir, `temp-${backup.filename}`)
        await writeFile(tempBackupPath, backupContent)
        backupFilePath = tempBackupPath
      } catch (error) {
        console.error('Failed to download backup from cloud:', error)
        return NextResponse.json(
          {
            error: 'Failed to download backup from cloud',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
    }

    // Verify backup file exists
    if (!existsSync(backupFilePath)) {
      return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 })
    }

    // Step 3: Restore the database using psql
    try {
      // First, drop all tables and schemas (clean slate)
      await execAsync(
        `PGPASSWORD="${dbParams.password}" psql -h "${dbParams.host}" -p "${dbParams.port}" -U "${dbParams.user}" -d "${dbParams.database}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO ${dbParams.user}; GRANT ALL ON SCHEMA public TO public;"`,
        {
          maxBuffer: 1024 * 1024 * 10,
          env: { ...process.env, PGPASSWORD: dbParams.password },
        }
      )

      // Then restore from the backup file
      const { stderr } = await execAsync(
        `PGPASSWORD="${dbParams.password}" psql -h "${dbParams.host}" -p "${dbParams.port}" -U "${dbParams.user}" -d "${dbParams.database}" -f "${backupFilePath}"`,
        {
          maxBuffer: 1024 * 1024 * 10,
          env: { ...process.env, PGPASSWORD: dbParams.password },
        }
      )

      if (stderr && !stderr.includes('Notice:') && !stderr.includes('WARNING:')) {
        console.error('psql stderr:', stderr)
      }
    } catch (error) {
      console.error('Database restore failed:', error)
      return NextResponse.json(
        {
          error: 'Failed to restore database',
          details: error instanceof Error ? error.message : 'Unknown error',
          safetyBackup: safetyFilename,
        },
        { status: 500 }
      )
    }

    // Step 4: Get the new item count after restore
    const restoredItemCount = await prisma.item.count()

    return NextResponse.json({
      success: true,
      message: 'Database restored successfully',
      backup: {
        filename: backup.filename,
        restoredItemCount,
        originalItemCount: backup.itemCount,
      },
      safetyBackup: safetyFilename,
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json(
      {
        error: 'Failed to restore backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
