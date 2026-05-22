'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-mint' },
  { href: '/lessons', label: 'Lessons', icon: BookOpen, color: 'bg-sky' },
  { href: '/progress', label: 'My Progress', icon: TrendingUp, color: 'bg-coral' },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const name = session?.user?.name ?? 'Student'
  const initial = name[0]?.toUpperCase() ?? 'S'

  return (
    <aside className="w-56 shrink-0 bg-paper border-r-[3px] border-ink min-h-screen flex flex-col">
      {/* Avatar / Name */}
      <div className="p-5 border-b-[3px] border-ink">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mint border-[3px] border-ink flex items-center justify-center text-ink font-display font-bold text-lg shadow-ink-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-ink text-sm truncate">{name}</p>
            <p className="text-xs text-ink/50 font-body">Student</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-100',
                isActive
                  ? 'bg-mint border-[3px] border-ink text-ink shadow-ink-sm'
                  : 'text-ink/60 hover:text-ink hover:bg-paper-dark'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t-[3px] border-ink">
        <p className="text-xs text-ink/40 font-body text-center">KeySprout v1.0</p>
      </div>
    </aside>
  )
}
