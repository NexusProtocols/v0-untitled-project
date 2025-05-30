import crypto from "crypto"

// Ad configuration
export const AD_FORMATS = {
  BANNER_300x250: {
    key: "6385f3f15fc29a03bca0a5ad55dd1114",
    format: "iframe",
    height: 250,
    width: 300,
  },
  BANNER_728x90: {
    key: "fd9b1c1a9efee5e08a1818fb900a7d69",
    format: "iframe",
    height: 90,
    width: 728,
  },
  BANNER_160x300: {
    key: "4a9add6d697b3d780b065e7fe02c57ec",
    format: "iframe",
    height: 300,
    width: 160,
  },
  BANNER_468x60: {
    key: "d8dd2bcdea1081e9008bb5c90174dcce",
    format: "iframe",
    height: 60,
    width: 468,
  },
  BANNER_320x50: {
    key: "3e8a77126905eb1bf6906ca144e2e0dd",
    format: "iframe",
    height: 50,
    width: 320,
  },
  BANNER_300x250_ALT: {
    key: "ecce4c01eb84e0ec55029c7e099cfe42",
    format: "iframe",
    height: 250,
    width: 300,
  },
  BANNER_160x300_ALT: {
    key: "18ea949e0bc955df6687e6f50c132f31",
    format: "iframe",
    height: 300,
    width: 160,
  },
  BANNER_320x50_ALT: {
    key: "7179942e65b874388da42494a8139abc",
    format: "iframe",
    height: 50,
    width: 320,
  },
  BANNER_160x600: {
    key: "bbdb586d7dd0a879016d8d1172d5fdb2",
    format: "iframe",
    height: 600,
    width: 160,
  },
  NATIVE_BANNER_1: {
    key: "422f69b8b1df4728bfc708120a974a18",
    format: "native",
    containerId: "container-422f69b8b1df4728bfc708120a974a18",
  },
  NATIVE_BANNER_2: {
    key: "14b4ba2ce1e7dd9109451b061b064954",
    format: "native",
    containerId: "container-14b4ba2ce1e7dd9109451b061b064954",
  },
}

export const DIRECT_LINK = "https://www.profitableratecpm.com/txyek2rn6?key=726b965803430cb5af9a1995ad42df28"
export const API_KEY = "01d60cbbf2c43ca8e7a491a0cb3a7160"

// Encrypt data with AES-256
export const encryptData = (data: string, key: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv)
  let encrypted = cipher.update(data, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

// Decrypt data with AES-256
export const decryptData = (encryptedData: string, key: string): string => {
  const parts = encryptedData.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// Generate a secure token for gateway validation
export const generateGatewayToken = (gatewayId: string, userId: string): string => {
  const timestamp = Date.now()
  const data = `${gatewayId}:${userId}:${timestamp}`
  const hash = crypto.createHash("sha256").update(data).digest("hex")
  return `${timestamp}:${hash}`
}

// Validate a gateway token
export const validateGatewayToken = (token: string, gatewayId: string, userId: string): boolean => {
  try {
    const [timestamp, hash] = token.split(":")
    const data = `${gatewayId}:${userId}:${timestamp}`
    const expectedHash = crypto.createHash("sha256").update(data).digest("hex")

    // Check if token is valid and not older than 30 minutes
    const isValid = hash === expectedHash
    const isNotExpired = Date.now() - Number.parseInt(timestamp) < 30 * 60 * 1000

    return isValid && isNotExpired
  } catch (error) {
    return false
  }
}

// Calculate creator earnings (70% of total)
export const calculateCreatorEarnings = (totalEarnings: number): number => {
  return totalEarnings * 0.7
}

// Generate a secure encryption key from the API key and a salt
export const generateEncryptionKey = (apiKey: string): string => {
  return crypto
    .createHash("sha256")
    .update(apiKey + "NEXUS_SALT")
    .digest("hex")
}
