import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'KeySprout — Learn to Type',
  description: 'A structured typing curriculum to master your keyboard with games, lessons, and progress tracking.',
}

const VALID_FONTS = new Set(['opendyslexic', 'atkinson', 'lexend', 'andika'])

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read preference cookies set by the client hooks so SSR can apply data attributes
  // before hydration — prevents any flash of unstyled/wrong-contrast content.
  const cookieStore = await cookies()
  const fontCookie = cookieStore.get('kq-font')?.value
  const contrastCookie = cookieStore.get('kq-contrast')?.value
  const dataFont = fontCookie && VALID_FONTS.has(fontCookie) ? fontCookie : undefined
  const dataContrast = contrastCookie === 'high' ? 'high' : undefined

  return (
    <html
      lang="en"
      {...(dataFont ? { 'data-font': dataFont } : {})}
      {...(dataContrast ? { 'data-contrast': dataContrast } : {})}
    >
      <body className="font-body">
        <Providers>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
