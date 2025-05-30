// Generate a hardware ID based on browser information
export function generateHWID(): string {
  if (typeof window === "undefined") return ""

  const components = [
    navigator.userAgent,
    screen.width.toString(),
    screen.height.toString(),
    navigator.language,
    navigator.platform,
    // Using available hardware information
    navigator.hardwareConcurrency?.toString(),
    navigator.deviceMemory?.toString(),
  ]
    .filter(Boolean)
    .join("|")

  // Create a hash from the components
  let hash = 0
  for (let i = 0; i < components.length; i++) {
    hash = (hash << 5) - hash + components.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }

  return `HWID-${Math.abs(hash).toString(16).padStart(8, "0").toUpperCase()}`
}

// Track HWID for the given username
export async function trackHWID(username: string): Promise<void> {
  try {
    const hwid = generateHWID()

    // Store the HWID for this user in localStorage
    const userData = JSON.parse(localStorage.getItem(`nexus_user_${username}`) || "{}")
    userData.hwid = hwid
    localStorage.setItem(`nexus_user_${username}`, JSON.stringify(userData))

    // Report to server
    await fetch("/api/track/hwid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hwid, username }),
    })
  } catch (error) {
    console.error("Error tracking HWID:", error)
  }
}

// Track IP address
export async function trackIP(): Promise<void> {
  try {
    await fetch("/api/track/ip")
  } catch (error) {
    console.error("Error tracking IP:", error)
  }
}
