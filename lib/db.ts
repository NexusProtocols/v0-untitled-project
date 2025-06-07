// Mock database client for initial deployment
// This will be replaced with actual Prisma client after successful deployment

export const db = {
  user: {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
  },
  script: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  game: {
    findUnique: async () => null,
    create: async () => ({}),
    upsert: async () => ({}),
  },
  category: {
    findMany: async () => [],
  },
  like: {
    create: async () => ({}),
    delete: async () => ({}),
    findUnique: async () => null,
  },
  gateway: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  supportRequest: {
    create: async () => ({}),
    findUnique: async () => null,
    update: async () => ({}),
  },
  $transaction: async (operations) => {
    return Promise.all(operations)
  },
}
