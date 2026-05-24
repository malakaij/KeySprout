'use client'

import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: React.ReactNode
  /** CSP nonce forwarded from middleware — available for any child <Script nonce> calls. */
  nonce?: string
}

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}
