import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const BACKUP_SETTINGS_KEY = 'backup_settings'

// GET /api/settings/backup - Load backup settings
export async function GET() {
  try {
    const settingsRecord = await prisma.settings.findUnique({
      where: { key: BACKUP_SETTINGS_KEY },
    })

    if (!settingsRecord) {
      // Return default settings if not found
      return NextResponse.json({
        settings: {
          automaticBackups: false,
          backupFrequency: 'weekly',
          backupRetention: 5,
          cloudStorageEnabled: false,
          cloudProvider: 'none',
        },
      })
    }

    return NextResponse.json({
      settings: settingsRecord.value,
    })
  } catch (error) {
    console.error('Failed to load backup settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

// POST /api/settings/backup - Save backup settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (typeof body.automaticBackups !== 'boolean') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }

    // Upsert settings (create or update)
    const settingsRecord = await prisma.settings.upsert({
      where: { key: BACKUP_SETTINGS_KEY },
      update: {
        value: body,
      },
      create: {
        key: BACKUP_SETTINGS_KEY,
        value: body,
      },
    })

    return NextResponse.json({
      success: true,
      settings: settingsRecord.value,
    })
  } catch (error) {
    console.error('Failed to save backup settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
