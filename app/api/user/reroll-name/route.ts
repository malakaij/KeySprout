import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateRandomDisplayName } from '@/lib/name-generator'

const DAILY_LIMIT = 3

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { rerollsToday: true, lastRerollDate: true, nameChangeRequested: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const usedToday =
    user.lastRerollDate && isToday(user.lastRerollDate) ? user.rerollsToday : 0

  if (usedToday >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'Daily limit reached. Try again tomorrow.', rerollsRemaining: 0 },
      { status: 429 }
    )
  }

  // Check if the student is in any approved class.
  const classMembership = await prisma.classMember.findFirst({
    where: { userId: session.user.id, status: 'APPROVED' },
  })
  const isInClass = !!classMembership

  const newCount = usedToday + 1
  const rerollsRemaining = DAILY_LIMIT - newCount

  if (isInClass) {
    // Flag the request — teacher will assign the new name.
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nameChangeRequested: true,
        rerollsToday: newCount,
        lastRerollDate: new Date(),
      },
    })
    return NextResponse.json({ requested: true, rerollsRemaining })
  } else {
    // Apply immediately.
    const newName = generateRandomDisplayName()
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: newName,
        rerollsToday: newCount,
        lastRerollDate: new Date(),
      },
    })
    return NextResponse.json({ newName, rerollsRemaining })
  }
}
