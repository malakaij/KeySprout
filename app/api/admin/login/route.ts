import { NextResponse } from 'next/server'
import { createAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

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
