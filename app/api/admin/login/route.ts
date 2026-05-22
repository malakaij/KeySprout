import { NextResponse } from 'next/server'
import { createAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { requestLogger } from '@/lib/logger'

export async function POST(req: Request) {
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')
  const { username, password } = await req.json()

  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) {
    log.error('admin credentials not configured')
    return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
  }

  if (username !== expectedUser || password !== expectedPass) {
    log.warn('admin login failed — invalid credentials')
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  log.info('admin login succeeded')
  const token = createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 4 * 60 * 60, // 4 hours
    path: '/',
  })
  return res
}
