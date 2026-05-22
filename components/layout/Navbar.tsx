'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-[3px] border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-display text-ink hover:text-coral transition-colors"
          >
            <span>🌱</span>
            <span>KeySprout</span>
          </Link>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-paper-dark transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-coral border-[3px] border-ink flex items-center justify-center text-white text-sm font-display shadow-ink-sm">
                    {(session.user.name ?? 'S')[0].toUpperCase()}
                  </div>
                  <span className="text-ink text-sm font-semibold hidden sm:block">
                    {session.user.name}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-ink/50 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-paper rounded-2xl border-[3px] border-ink py-2 z-50 shadow-ink">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-paper-dark transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-mint" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-paper-dark transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-coral" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="kq-btn px-5 py-2 bg-coral text-white font-display text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
