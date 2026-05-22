import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  if (!await isAdminAuthenticated()) {
    return <AdminLogin />
  }

  const [courseCount, lessonCount, userCount, attemptCount] = await Promise.all([
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.user.count(),
    prisma.lessonAttempt.count(),
  ])

  const isSeeded = courseCount > 0 && lessonCount > 0

  return (
    <AdminDashboard
      isSeeded={isSeeded}
      stats={{ courses: courseCount, lessons: lessonCount, users: userCount, attempts: attemptCount }}
    />
  )
}
