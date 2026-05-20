'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard, accent: 'bg-mint' },
  { href: '/teacher/classes', label: 'Students', icon: Users, accent: 'bg-sky' },
  { href: '/teacher/curriculum', label: 'Curriculum', icon: BookOpen, accent: 'bg-sunny' },
  { href: '/teacher/insights', label: 'Insights', icon: BarChart2, accent: 'bg-coral' },
]

export function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-ink min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <p className="text-xs font-display text-white/40 uppercase tracking-widest">Teacher Portal</p>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/teacher' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-100',
                isActive
                  ? `${item.accent} text-ink border-2 border-white/20`
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/30 font-body text-center">KeySprout v1.0</p>
      </div>
    </aside>
  )
}
