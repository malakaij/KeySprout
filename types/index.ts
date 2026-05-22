export interface LessonWithProgress {
  id: string
  title: string
  description: string | null
  content: string | null
  type: 'SCRIPTED' | 'DYNAMIC'
  order: number
  sectionId: string
  targetKeys: string[]
  minWpm: number | null
  targetWpm: number | null
  minAccuracy: number | null
  attempts: number
  bestWpm: number | null
  bestAccuracy: number | null
  passed: boolean
}

export interface SectionWithLessons {
  id: string
  title: string
  description: string | null
  order: number
  lessons: LessonWithProgress[]
}

export interface CourseWithSections {
  id: string
  title: string
  description: string | null
  sections: SectionWithLessons[]
}

export interface AttemptResult {
  wpm: number
  accuracy: number
  duration: number
  errors: number
  completedAt: Date
}

export interface StudentProgress {
  userId: string
  name: string | null
  email: string | null
  image: string | null
  nameChangeRequested: boolean
  totalAttempts: number
  averageWpm: number
  averageAccuracy: number
  lessonsCompleted: number
  recentAttempts: Array<{
    id: string
    lessonId: string
    lessonTitle: string
    wpm: number
    accuracy: number
    completedAt: Date
  }>
}

export interface WeakKeys {
  [key: string]: number
}

export interface ClassroomWithMembers {
  id: string
  name: string
  description: string | null
  code: string
  teacherId: string
  createdAt: Date
  members: Array<{
    id: string
    userId: string
    joinedAt: Date
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
  }>
}
