import crypto from "crypto"

// AES-192 encryption for key validation
const ALGORITHM = "aes-192-cbc"
const KEY_LENGTH = 24 // 192 bits = 24 bytes
const IV_LENGTH = 16 // 16 bytes for AES

// Get encryption key from environment or generate a secure one
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_SECRET
  if (envKey && Buffer.from(envKey).length >= KEY_LENGTH) {
    return Buffer.from(envKey).slice(0, KEY_LENGTH)
  }

  // If no valid key in env, generate a secure one (for development only)
  console.warn("Warning: Using generated encryption key. Set ENCRYPTION_SECRET in environment for production.")
  return crypto.scryptSync("nexus-default-key", "salt", KEY_LENGTH)
}

// Generate a random initialization vector
export const generateIV = (): string => {
  return crypto.randomBytes(IV_LENGTH).toString("hex")
}

// Encrypt data
export const encrypt = (text: string, ivHex?: string): { encryptedData: string; iv: string } => {
  const key = getEncryptionKey()
  const iv = ivHex ? Buffer.from(ivHex, "hex") : crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return {
    encryptedData: encrypted,
    iv: ivHex || iv.toString("hex"),
  }
}

// Decrypt data
export const decrypt = (encryptedData: string, ivHex: string): string => {
  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// Generate a secure key with prefix
export const generateKey = (prefix = "NEXUS-"): string => {
  const randomBytes = crypto.randomBytes(12).toString("hex").toUpperCase()
  const segments = []

  // Split into groups of 4 characters
  for (let i = 0; i < randomBytes.length; i += 4) {
    segments.push(randomBytes.slice(i, i + 4))
  }

  return `${prefix}${segments.join("-")}`
}

// Validate a key format (not checking if it's actually valid in the system)
export const isValidKeyFormat = (key: string): boolean => {
  // Basic format check: PREFIX-XXXX-XXXX-XXXX-XXXX
  const keyRegex = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/
  return keyRegex.test(key)
}
