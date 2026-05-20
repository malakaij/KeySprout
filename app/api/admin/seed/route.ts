import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { seedDatabase } from '@/lib/seed-db'

export async function POST() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await seedDatabase()
    return NextResponse.json({ message: 'Database seeded successfully with 250 lessons.' })
  } catch (e) {
    console.error('Seed error:', e)
    return NextResponse.json({ error: 'Seed failed — check server logs.' }, { status: 500 })
  }
}
