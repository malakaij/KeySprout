import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'
import type { Prisma } from '@prisma/client'

const FONT_VALUES = ['default', 'opendyslexic', 'atkinson', 'lexend', 'andika'] as const

const patchSchema = z.object({
  fontPreference: z.enum(FONT_VALUES).optional(),
  highContrast: z.boolean().optional(),
})

/** Parses the raw Json column into a typed preferences object. */
function parsePrefs(raw: Prisma.JsonValue): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

/** Returns the authenticated user's stored preferences. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  })

  const prefs = parsePrefs(user?.preferences ?? null)
  return NextResponse.json({
    fontPreference: (prefs.fontPreference as string) ?? 'default',
    highContrast: (prefs.highContrast as boolean) ?? false,
  })
}

/** Merges the supplied keys into the authenticated user's stored preferences. */
export async function PATCH(req: Request) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  })

  const existing = parsePrefs(user?.preferences ?? null)
  const updated = { ...existing, ...parsed.data }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferences: updated },
  })

  return NextResponse.json({ ok: true, preferences: updated })
}
