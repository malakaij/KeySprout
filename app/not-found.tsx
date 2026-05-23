import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Pip } from '@/components/ui/Pip'

export default async function NotFound() {
  const session = await getServerSession(authOptions)

  // Route the "Go home" button to the right dashboard based on role.
  const homeHref =
    session?.user?.role === 'TEACHER'
      ? '/teacher/dashboard'
      : session?.user
        ? '/dashboard'
        : '/'

  const homeLabel =
    session?.user?.role === 'TEACHER'
      ? 'Back to teacher dashboard'
      : session?.user
        ? 'Back to dashboard'
        : 'Go to home page'

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Pip size="lg" variant="wave" />
        </div>

        <div className="inline-flex items-center gap-2 kq-chip bg-sunny/20 border-sunny text-ink text-sm mb-6">
          <span>404</span>
        </div>

        <h1 className="text-3xl font-display text-ink mb-3">
          Looks like that page wandered off!
        </h1>
        <p className="text-ink-muted font-body mb-8">
          Pip looked everywhere but couldn&apos;t find what you were after.
          Maybe the link was mistyped, or the page moved somewhere new.
        </p>

        <Link href={homeHref} className="kq-btn bg-coral text-white px-8 py-3 font-display inline-block">
          {homeLabel}
        </Link>
      </div>
    </main>
  )
}
