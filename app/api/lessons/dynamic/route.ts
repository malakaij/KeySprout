import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateDynamicText } from '@/lib/typing-engine'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'

const bodySchema = z.object({
  weakKeys: z.array(z.string()),
})

export async function POST(req: Request) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { weakKeys } = parsed.data
  const text = generateDynamicText(weakKeys, 200)

  return NextResponse.json({ text })
}
