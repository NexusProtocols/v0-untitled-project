// Update the Prisma client configuration to use Supabase connection pooling
import { PrismaClient } from "@prisma/client"

// Add this interface to handle connection URLs
interface CustomNodeJSGlobal extends NodeJS.Global {
  prisma: PrismaClient
}

declare const global: CustomNodeJSGlobal

const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL + "&connection_limit=5&pool_timeout=10",
      },
    },
    log: [
      { level: "warn", emit: "event" },
      { level: "info", emit: "event" },
      { level: "error", emit: "event" },
    ],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// Add error handling for connection issues
prisma.$on("warn", (e) => {
  console.warn("Prisma Warning:", e)
})

prisma.$on("info", (e) => {
  console.info("Prisma Info:", e)
})

prisma.$on("error", (e) => {
  console.error("Prisma Error:", e)
})

export { prisma }
