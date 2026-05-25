-- Add reversibly-encrypted password for teacher-side password reveal.
-- passwordHash (bcrypt) is used for authentication; encryptedPassword
-- (AES-256-GCM) is used only for display by the teacher who owns the class.
ALTER TABLE "User" ADD COLUMN "encryptedPassword" TEXT;
