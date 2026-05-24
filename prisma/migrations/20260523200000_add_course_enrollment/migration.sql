-- Add icon, subtitle, accent fields to Course
ALTER TABLE "Course" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Course" ADD COLUMN "icon" TEXT NOT NULL DEFAULT '⌨️';
ALTER TABLE "Course" ADD COLUMN "accent" TEXT NOT NULL DEFAULT 'mint';

-- CourseEnrollment: tracks which students are enrolled in which courses
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLessonAt" TIMESTAMP(3),
    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON "CourseEnrollment"("userId", "courseId");
