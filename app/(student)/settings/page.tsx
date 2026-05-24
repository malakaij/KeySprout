import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Settings, Keyboard, ArrowRight } from 'lucide-react'
import { NameCard } from '@/components/dashboard/NameCard'
import { JoinClassCard } from '@/components/dashboard/JoinClassCard'
import { DisplaySettings } from '@/components/ui/DisplaySettings'

const DAILY_LIMIT = 3

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const userId = session.user.id

  const [userData, approvedMembership] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, rerollsToday: true, lastRerollDate: true, nameChangeRequested: true },
    }),
    prisma.classMember.findFirst({ where: { userId, status: 'APPROVED' } }),
  ])

  const usedToday =
    userData?.lastRerollDate && isToday(userData.lastRerollDate)
      ? userData.rerollsToday
      : 0
  const rerollsRemaining = Math.max(0, DAILY_LIMIT - usedToday)
  const isInClass = !!approvedMembership

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-grape" aria-hidden="true" />
        <h1 className="text-2xl font-display text-ink">Settings</h1>
      </div>

      {/* Username */}
      <section aria-labelledby="settings-username-heading">
        <h2 id="settings-username-heading" className="text-xs font-display text-ink-muted uppercase tracking-wider mb-3">
          Username
        </h2>
        <NameCard
          currentName={userData?.name ?? 'Unknown'}
          rerollsRemaining={rerollsRemaining}
          nameChangeRequested={userData?.nameChangeRequested ?? false}
          isInClass={isInClass}
        />
      </section>

      {/* Class */}
      <section aria-labelledby="settings-class-heading">
        <h2 id="settings-class-heading" className="text-xs font-display text-ink-muted uppercase tracking-wider mb-3">
          Class
        </h2>
        <JoinClassCard />
      </section>

      {/* Display */}
      <section aria-labelledby="settings-display-heading">
        <h2 id="settings-display-heading" className="text-xs font-display text-ink-muted uppercase tracking-wider mb-3">
          Display
        </h2>
        <div className="kq-card p-5">
          <DisplaySettings alwaysOpen />
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section aria-labelledby="settings-shortcuts-heading">
        <div className="kq-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-ink-muted shrink-0" />
            <div>
              <h2 id="settings-shortcuts-heading" className="font-display text-base text-ink">Keyboard shortcuts</h2>
              <p className="text-sm font-body text-ink-muted mt-0.5">View all keyboard shortcuts for lessons and games.</p>
            </div>
          </div>
          <Link href="/help" className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-4 py-2 text-sm font-display">
            View <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
