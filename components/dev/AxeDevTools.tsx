'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const IMPACT_COLOR: Record<string, string> = {
  critical: '#ff0000',
  serious:  '#ff5e5b',
  moderate: '#ffd23f',
  minor:    '#4ea8de',
}

/**
 * Runs axe-core against the current page after every route change in development.
 * Violations are reported to the browser console. Renders nothing to the DOM.
 *
 * Only included in the layout when NODE_ENV === 'development'.
 */
export function AxeDevTools() {
  const pathname = usePathname()

  useEffect(() => {
    // Wait for the page to fully paint before auditing.
    const timer = setTimeout(async () => {
      const { default: axe } = await import('axe-core')
      const results = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
      })

      if (results.violations.length === 0) {
        console.log(`%c[axe] ✓ No violations on ${pathname}`, 'color: #4dd4ac; font-weight: bold')
        return
      }

      console.group(
        `%c[axe] ${results.violations.length} violation(s) on ${pathname}`,
        'color: #ff5e5b; font-weight: bold'
      )
      results.violations.forEach((v) => {
        const color = IMPACT_COLOR[v.impact ?? 'minor']
        console.group(`%c${(v.impact ?? 'minor').toUpperCase()} — ${v.id}: ${v.description}`, `color: ${color}; font-weight: bold`)
        console.log('Help:', v.helpUrl)
        v.nodes.forEach((node) => {
          console.log('Node:', node.html)
          if (node.failureSummary) console.log('Fix:', node.failureSummary)
        })
        console.groupEnd()
      })
      console.groupEnd()
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
