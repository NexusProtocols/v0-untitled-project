import { prisma } from "./prisma"

// This function will be used to test the database connection
export async function initDatabase() {
  try {
    // Test the connection by getting the count of users
    const userCount = await prisma.user.count()
    console.log(`Database connection successful. User count: ${userCount}`)
    return true
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    return false
  }
}

// Export the prisma client
export { prisma }
