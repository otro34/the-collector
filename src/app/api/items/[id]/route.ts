import { NextResponse } from 'next/server'
import { getItemById } from '@/lib/db-utils'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await getItemById(id)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Get item by ID error:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await request.json()
    // TODO: Implement update logic in US-4.5
    console.log('Update request for item:', id)
    return NextResponse.json({ message: 'Update not yet implemented' }, { status: 501 })
  } catch (error) {
    console.error('Update item error:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    // TODO: Implement delete logic in US-4.6
    console.log('Delete request for item:', id)
    return NextResponse.json({ message: 'Delete not yet implemented' }, { status: 501 })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
