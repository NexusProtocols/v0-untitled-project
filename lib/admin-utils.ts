"use server"

// List of admin usernames - this will not be exposed to the client
const adminUsers = [
  "Nexus",
  "Voltrex",
  "Furky",
  "Ocean",
  "nexus", // Added lowercase version
  "volt", // Added "volt"
  // Add more admin usernames here
]

// Server-side function to check if a user is an admin
export async function isAdminServer(username: string | undefined): Promise<boolean> {
  if (!username) return false

  // Convert to lowercase for case-insensitive comparison
  const lowercaseUsername = username.toLowerCase()

  // Check if the lowercase username is in the admin list (also converted to lowercase)
  return adminUsers.some((admin) => admin.toLowerCase() === lowercaseUsername)
}
