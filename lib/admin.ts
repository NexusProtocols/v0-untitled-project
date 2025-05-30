import { isAdminServer } from "@/lib/admin-utils"

// Client-side function that calls the server function
export async function isAdmin(username: string | undefined): Promise<boolean> {
  // First check for admin token in localStorage
  try {
    const adminToken = localStorage.getItem("nexus_admin_token")
    if (adminToken && (adminToken === "nexus_admin" || adminToken === "volt_admin")) {
      return true
    }
  } catch (error) {
    // Ignore errors when accessing localStorage (might be in SSR context)
  }

  // If no username provided, return false
  if (!username) return false

  try {
    // Special case for "nexus" or "volt" usernames
    const lowercaseUsername = username.toLowerCase()
    if (lowercaseUsername === "nexus" || lowercaseUsername === "volt") {
      return true
    }

    return await isAdminServer(username)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
