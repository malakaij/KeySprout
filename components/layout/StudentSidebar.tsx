'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Gamepad2,
  TrendingUp,
  Settings,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, accent: 'bg-mint',  exact: true },
  { href: '/courses',   label: 'Courses',    icon: Compass,         accent: 'bg-berry' },
  { href: '/lessons',   label: 'Lessons',    icon: BookOpen,        accent: 'bg-sky' },
  { href: '/games',     label: 'Games',      icon: Gamepad2,        accent: 'bg-sunny' },
  { href: '/progress',  label: 'My Progress', icon: TrendingUp,     accent: 'bg-coral' },
  { href: '/settings',  label: 'Settings',   icon: Settings,        accent: 'bg-grape' },
]

/** Collapsible student navigation sidebar. Collapse state is local to the component. */
export function StudentSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const name = session?.user?.name ?? 'Student'
  const initial = name[0]?.toUpperCase() ?? 'S'

  return (
    <aside
      style={{ width: collapsed ? 72 : 224, transition: 'width 180ms ease' }}
      className="shrink-0 bg-paper border-r-[3px] border-ink min-h-screen flex flex-col overflow-hidden"
      aria-label="Student navigation"
    >
      {/* Header: toggle + avatar */}
      <div className={cn('border-b-[3px] border-ink flex flex-col', collapsed ? 'p-2 items-center gap-2' : 'p-4 gap-3')}>
        <div className={cn('flex w-full', collapsed ? 'justify-center' : 'justify-end')}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-lg bg-paper-dark border-[2px] border-ink shadow-[2px_2px_0_#1a1a2e] flex items-center justify-center hover:bg-paper transition-colors"
          >
            <PanelLeft
              className="w-4 h-4 text-ink"
              style={{ transform: collapsed ? 'scaleX(-1)' : undefined }}
            />
          </button>
        </div>

        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-10 h-10 rounded-full bg-mint border-[3px] border-ink flex items-center justify-center text-ink font-display font-bold text-lg shadow-ink-sm shrink-0">
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm truncate">{name}</p>
              <p className="text-xs text-ink-muted font-body">Student</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-3')}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full mx-auto transition-all duration-100',
                  isActive
                    ? `${item.accent} border-[3px] border-ink text-ink shadow-ink-sm`
                    : 'text-ink-muted hover:text-ink hover:bg-paper-dark',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-100',
                isActive
                  ? `${item.accent} border-[3px] border-ink text-ink shadow-ink-sm`
                  : 'text-ink-muted hover:text-ink hover:bg-paper-dark',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t-[3px] border-ink">
          <p className="text-xs text-ink-muted font-body text-center">KeySprout</p>
        </div>
      )}
    </aside>
  )
}
