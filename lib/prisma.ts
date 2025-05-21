import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  // In production, use the standard Prisma client
  prisma = new PrismaClient({
    log: ["error"],
  })
} else {
  // In development, use the global instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    })
  }
  prisma = globalForPrisma.prisma
}

export { prisma }
export default prisma
