import crypto from "crypto"

// AES-256 encryption/decryption functions
const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32 // 256 bits = 32 bytes
const IV_LENGTH = 16 // 16 bytes for AES

// Get encryption key from environment or generate a secure one
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_SECRET
  if (envKey && Buffer.from(envKey).length >= KEY_LENGTH) {
    return Buffer.from(envKey).slice(0, KEY_LENGTH)
  }

  // If no valid key in env, generate a secure one (for development only)
  console.warn("Warning: Using generated encryption key. Set ENCRYPTION_SECRET in environment for production.")
  return crypto.scryptSync("nexus-secure-gateway-key", "nexus-salt", KEY_LENGTH)
}

// Encrypt data with AES-256
export const encryptGatewayData = (data: any): { encryptedData: string; iv: string } => {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex")
  encrypted += cipher.final("hex")

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  }
}

// Decrypt data with AES-256
export const decryptGatewayData = (encryptedData: string, ivHex: string): any => {
  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return JSON.parse(decrypted)
}

// Generate a secure token for gateway validation
export const generateGatewayToken = (gatewayId: string, userId: string, stage: number): string => {
  const tokenData = {
    gatewayId,
    userId,
    stage,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  }

  const { encryptedData, iv } = encryptGatewayData(tokenData)
  return `${encryptedData}:${iv}`
}

// Validate a gateway token
export const validateGatewayToken = (token: string, gatewayId: string, userId: string, stage: number): boolean => {
  try {
    const [encryptedData, iv] = token.split(":")
    const decryptedData = decryptGatewayData(encryptedData, iv)

    // Check if token matches expected values
    const isValidGateway = decryptedData.gatewayId === gatewayId
    const isValidUser = decryptedData.userId === userId
    const isValidStage = decryptedData.stage === stage

    // Check if token is not expired (30 minutes)
    const isNotExpired = Date.now() - decryptedData.timestamp < 30 * 60 * 1000

    return isValidGateway && isValidUser && isValidStage && isNotExpired
  } catch (error) {
    console.error("Error validating gateway token:", error)
    return false
  }
}

// Generate a secure hash for task completion
export const generateTaskCompletionHash = (gatewayId: string, userId: string, taskId: string): string => {
  const data = `${gatewayId}:${userId}:${taskId}:${Date.now()}`
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Anti-tampering check for local storage data
export const verifyLocalStorageIntegrity = (gatewayId: string, userId: string, storedData: string): boolean => {
  try {
    // Extract the data and signature
    const [data, signature] = storedData.split(".")

    // Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", getEncryptionKey())
      .update(`${gatewayId}:${userId}:${data}`)
      .digest("hex")

    return signature === expectedSignature
  } catch (error) {
    return false
  }
}

// Sign local storage data to prevent tampering
export const signLocalStorageData = (gatewayId: string, userId: string, data: any): string => {
  const dataString = JSON.stringify(data)

  // Create signature
  const signature = crypto
    .createHmac("sha256", getEncryptionKey())
    .update(`${gatewayId}:${userId}:${dataString}`)
    .digest("hex")

  return `${dataString}.${signature}`
}
