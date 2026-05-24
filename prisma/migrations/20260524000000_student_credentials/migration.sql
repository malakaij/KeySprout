-- Add passwordHash to User for student credential accounts
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- StudentLoginToken: single-use QR login tokens for printed login cards
CREATE TABLE "StudentLoginToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentLoginToken_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StudentLoginToken" ADD CONSTRAINT "StudentLoginToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentLoginToken" ADD CONSTRAINT "StudentLoginToken_classroomId_fkey"
    FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "StudentLoginToken_tokenHash_key" ON "StudentLoginToken"("tokenHash");
