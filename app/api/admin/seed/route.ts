import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { seedDatabase } from '@/lib/seed-db'
import { requestLogger } from '@/lib/logger'

export async function POST(req: Request) {
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    log.info('database seed started')
    await seedDatabase()
    log.info('database seed completed')
    return NextResponse.json({ message: 'Database seeded successfully with 250 lessons.' })
  } catch (e) {
    log.error({ err: e }, 'database seed failed')
    return NextResponse.json({ error: 'Seed failed — check server logs.' }, { status: 500 })
  }
}
