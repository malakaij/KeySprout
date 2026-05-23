'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, BarChart2, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/teacher',            label: 'Dashboard',  icon: LayoutDashboard, accent: 'bg-mint',  exact: true },
  { href: '/teacher/classes',    label: 'Students',   icon: Users,           accent: 'bg-sky' },
  { href: '/teacher/curriculum', label: 'Curriculum', icon: BookOpen,        accent: 'bg-sunny' },
  { href: '/teacher/insights',   label: 'Insights',   icon: BarChart2,       accent: 'bg-coral' },
]

/** Collapsible teacher navigation sidebar. Collapse state is local to the component. */
export function TeacherSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{ width: collapsed ? 72 : 224, transition: 'width 180ms ease' }}
      className="shrink-0 bg-paper border-r-[3px] border-ink min-h-screen flex flex-col overflow-hidden"
      aria-label="Teacher navigation"
    >
      {/* Header: toggle + portal label */}
      <div className={cn('border-b-[3px] border-ink flex flex-col', collapsed ? 'p-2 items-center gap-2' : 'p-4 gap-2')}>
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
        {!collapsed && (
          <p className="text-xs font-display text-ink-muted uppercase tracking-widest">Teacher Portal</p>
        )}
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
