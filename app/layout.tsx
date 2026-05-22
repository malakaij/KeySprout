import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export const metadata: Metadata = {
  title: 'KeySprout — Learn to Type',
  description: 'A structured typing curriculum to master your keyboard with games, lessons, and progress tracking.',
  applicationName: 'KeySprout',
  manifest: '/manifest.webmanifest',
  themeColor: '#16a34a',
  appleWebApp: {
    capable: true,
    title: 'KeySprout',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>
          <Navbar />
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
