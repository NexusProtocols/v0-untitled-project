// This file contains server-side admin check functionality
// This is more secure as it's not exposed to the client

// List of admin usernames - this will not be exposed to the client
const adminUsers = [
  "admin",
  "owner",
  "nexus",
  "volt",
  "Nexus",
  "Voltrex",
  "Furky",
  "Ocean",
  // Add more admin usernames here
]

// Server-side function to check if a user is an admin
export async function checkIsAdmin(username: string | undefined): Promise<boolean> {
  if (!username) return false

  // You could add additional security measures here:
  // 1. Check against a database instead of a hardcoded list
  // 2. Verify with a JWT or session token
  // 3. Add rate limiting to prevent brute force attempts
  // 4. Log admin access attempts for security auditing

  // Case-insensitive check
  return adminUsers.some((admin) => admin.toLowerCase() === username.toLowerCase())
}

// Function to verify admin token (for additional security)
export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false

  // In a real application, you would verify this token against a secure store
  // For this demo, we'll use a simple check
  const validTokens = process.env.ADMIN_TOKENS?.split(",") || []

  return validTokens.includes(token)
}
