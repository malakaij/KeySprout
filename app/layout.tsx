import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'KeySprout — Learn to Type',
  description: 'A structured typing curriculum to master your keyboard with games, lessons, and progress tracking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Inline script applies saved font preference before React hydrates, preventing a flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var f=localStorage.getItem('kq-font');if(f&&f!=='default')document.documentElement.setAttribute('data-font',f)}catch(e){}`,
          }}
        />
      </head>
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
