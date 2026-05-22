import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requestLogger } from '@/lib/logger'

const bodySchema = z.object({
  gameType: z.enum(['WORD_RAIN', 'LETTER_HUNT']),
  score: z.number().nonnegative(),
  level: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
})

export async function POST(req: Request) {
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { gameType, score, level, duration } = parsed.data

  const gameScore = await prisma.gameScore.create({
    data: {
      userId: session.user.id,
      gameType,
      score,
      level,
      duration,
    },
  })

  log.info({ gameType, score }, 'game score recorded')
  return NextResponse.json({ gameScore })
}
