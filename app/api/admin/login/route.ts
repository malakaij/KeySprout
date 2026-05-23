import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { createAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { requestLogger } from '@/lib/logger'

const bodySchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
})

export async function POST(req: Request) {
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')

  // Rate-limit by IP — 10 attempts per 5 minutes.
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  const rl = await checkRateLimit(`admin_login:${ip}`, 10, 5 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { username, password } = parsed.data

  const expectedUser = process.env.SUPER_ADMIN_USERNAME
  const expectedHash = process.env.SUPER_ADMIN_PASSWORD

  if (!expectedUser || !expectedHash) {
    log.error('super-admin credentials not configured')
    return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
  }

  const usernameMatch = username === expectedUser
  // Always run bcrypt.compare even on username mismatch to prevent timing attacks.
  const passwordMatch = await compare(password, expectedHash).catch(() => false)

  if (!usernameMatch || !passwordMatch) {
    log.warn('super-admin login failed — invalid credentials')
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  log.info('super-admin login succeeded')
  const token = createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 4 * 60 * 60,
    path: '/',
  })
  return res
}
