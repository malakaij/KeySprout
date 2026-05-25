import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

/**
 * Returns the encryption key buffer, or null if PASSWORD_ENCRYPTION_KEY is not configured.
 * Key must be a 64-character hex string (32 bytes).
 */
function getKey(): Buffer | null {
  const hex = process.env.PASSWORD_ENCRYPTION_KEY ?? ''
  if (hex.length !== 64) return null
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypts a plain-text password for reversible storage.
 * Returns null if PASSWORD_ENCRYPTION_KEY is not set.
 * Format: hex(iv[12] + authTag[16] + ciphertext).
 */
export function encryptPassword(plain: string): string | null {
  const key = getKey()
  if (!key) return null
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('hex')
}

/**
 * Decrypts a value produced by encryptPassword.
 * Returns null if decryption fails or the key is not configured.
 */
export function decryptPassword(encoded: string): string | null {
  const key = getKey()
  if (!key) return null
  try {
    const buf = Buffer.from(encoded, 'hex')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const ciphertext = buf.subarray(28)
    const decipher = createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
