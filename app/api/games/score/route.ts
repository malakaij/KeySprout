import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  gameType: z.enum(['WORD_RAIN', 'LETTER_HUNT']),
  score: z.number().nonnegative(),
  level: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
})

export async function POST(req: Request) {
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

  return NextResponse.json({ gameScore })
}
