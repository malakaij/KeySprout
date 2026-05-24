import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requestLogger } from '@/lib/logger'
import { verifySameOrigin } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'

const bodySchema = z.object({
  wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(1),
  duration: z.number().nonnegative(),
  errors: z.number().nonnegative(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')

  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(`lesson_complete:${session.user.id}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { wpm, accuracy, duration, errors } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      section: {
        include: {
          course: {
            include: {
              sections: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const [attempt] = await prisma.$transaction([
    prisma.lessonAttempt.create({
      data: { userId: session.user.id, lessonId: id, wpm, accuracy, duration, errors },
    }),
    // Ensure enrollment exists and update lastLessonAt so the Courses page stays current
    prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: lesson.section.courseId } },
      create: { userId: session.user.id, courseId: lesson.section.courseId, lastLessonAt: new Date() },
      update: { lastLessonAt: new Date() },
    }),
  ])

  // Find next lesson: next in same section by order, or first lesson of next section
  const currentSection = lesson.section
  const allSections = currentSection.course.sections
  const currentSectionLessons = allSections.find((s) => s.id === currentSection.id)?.lessons ?? []
  const currentLessonIndex = currentSectionLessons.findIndex((l) => l.id === lesson.id)

  let nextLesson = null

  if (currentLessonIndex < currentSectionLessons.length - 1) {
    // Next lesson in the same section
    nextLesson = currentSectionLessons[currentLessonIndex + 1]
  } else {
    // Find next section
    const currentSectionIndex = allSections.findIndex((s) => s.id === currentSection.id)
    if (currentSectionIndex < allSections.length - 1) {
      const nextSection = allSections[currentSectionIndex + 1]
      if (nextSection.lessons.length > 0) {
        nextLesson = nextSection.lessons[0]
      }
    }
  }

  log.info({ lessonId: id, wpm, accuracy }, 'lesson completed')
  return NextResponse.json({ attempt, nextLesson })
}
