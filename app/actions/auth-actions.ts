"use server"

import { checkIsAdmin } from "@/lib/admin-server"
import { cookies } from "next/headers"

// Server action to check if a user is an admin
export async function verifyAdminStatus(username: string | undefined): Promise<boolean> {
  try {
    // Add additional security checks here
    // For example, verify the request is coming from a valid session
    const cookieStore = cookies()
    const currentUser = cookieStore.get("nexus_current_user")

    // Verify the username matches the current user in the cookie
    if (!currentUser || currentUser.value !== username) {
      return false
    }

    // Check if the user is an admin
    return await checkIsAdmin(username)
  } catch (error) {
    console.error("Error verifying admin status:", error)
    return false
  }
}

// Server action to verify a user's session
export async function verifyUserSession(username: string | undefined): Promise<boolean> {
  try {
    if (!username) return false

    const cookieStore = cookies()
    const currentUser = cookieStore.get("nexus_current_user")

    // Verify the username matches the current user in the cookie
    return currentUser?.value === username
  } catch (error) {
    console.error("Error verifying user session:", error)
    return false
  }
}
