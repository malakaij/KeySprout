import { Keyboard, Navigation, BookOpen, Gamepad2 } from 'lucide-react'

interface ShortcutRowProps {
  keys: string[]
  action: string
}

function ShortcutRow({ keys, action }: ShortcutRowProps) {
  return (
    <tr className="border-b border-ink/10 last:border-0">
      <td className="py-2.5 pr-6 align-top w-48">
        <span className="flex flex-wrap gap-1">
          {keys.map((k, i) => (
            <span key={k}>
              <kbd className="inline-block bg-paper-dark border-2 border-ink rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-ink shadow-ink-sm leading-tight">
                {k}
              </kbd>
              {i < keys.length - 1 && (
                <span className="text-ink-muted text-xs font-body mx-1">or</span>
              )}
            </span>
          ))}
        </span>
      </td>
      <td className="py-2.5 text-sm font-body text-ink">{action}</td>
    </tr>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <section aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center gap-2 mb-3">
        <span aria-hidden="true">{icon}</span>
        <h2
          id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="font-display text-ink text-lg"
        >
          {title}
        </h2>
      </div>
      <div className="kq-card p-4 overflow-x-auto">
        <table className="w-full">
          <thead className="sr-only">
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  )
}

export default function KeyboardShortcutsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-display text-ink">Keyboard Shortcuts</h1>
        <p className="text-ink-muted mt-1 font-body">
          Every keyboard control available in KeySprout.
        </p>
      </header>

      <Section icon={<Navigation className="w-5 h-5 text-sky" />} title="Navigation">
        <ShortcutRow keys={['Tab']} action="Move focus to the next button, link, or input" />
        <ShortcutRow keys={['Shift + Tab']} action="Move focus to the previous button, link, or input" />
        <ShortcutRow keys={['Enter', 'Space']} action="Activate the focused button or link" />
        <ShortcutRow keys={['Tab (first press on any page)']} action="Reveal the 'Skip to main content' link — press Enter to jump past the navbar" />
      </Section>

      <Section icon={<BookOpen className="w-5 h-5 text-mint" />} title="Typing Lessons">
        <ShortcutRow keys={['Click']} action="Click the typing area to focus it before you start" />
        <ShortcutRow keys={['Any character key']} action="Type the character — it is checked against the current position in the lesson" />
        <ShortcutRow keys={['Backspace']} action="Erase the last typed character" />
        <ShortcutRow keys={['Ctrl / Cmd / Alt + any key']} action="Ignored — browser shortcuts work normally and do not affect the lesson" />
      </Section>

      <Section icon={<Gamepad2 className="w-5 h-5 text-coral" />} title="Letter Hunt">
        <ShortcutRow keys={['Highlighted letter key']} action="Score a point and advance to the next letter" />
        <ShortcutRow keys={['Any other letter key']} action="Resets your combo — does not penalise your score" />
      </Section>

      <Section icon={<Gamepad2 className="w-5 h-5 text-sunny" />} title="Word Rain">
        <ShortcutRow keys={['Letter keys']} action="Type the word shown on a falling tile" />
        <ShortcutRow keys={['Space', 'Enter']} action="Submit the typed word — destroys the matching tile if correct" />
      </Section>

      <Section icon={<Keyboard className="w-5 h-5 text-grape" />} title="Display Settings">
        <ShortcutRow keys={['Tab / Shift + Tab']} action="Navigate the font radio buttons and the high-contrast toggle" />
        <ShortcutRow keys={['Arrow keys']} action="Move between font options once a radio button has focus" />
        <ShortcutRow keys={['Space']} action="Toggle the high-contrast switch" />
      </Section>
    </div>
  )
}
