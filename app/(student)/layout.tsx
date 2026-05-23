import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { StudentSidebar } from '@/components/layout/StudentSidebar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <StudentSidebar />
      <main id="main-content" className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
