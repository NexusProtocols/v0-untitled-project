// Mock PrismaClient type definition
declare module "@prisma/client" {
  export class PrismaClient {
    constructor(options?: any)

    user: {
      findUnique: (args: any) => Promise<any>
      findFirst: (args: any) => Promise<any>
      create: (args: any) => Promise<any>
      update: (args: any) => Promise<any>
      upsert: (args: any) => Promise<any>
    }

    script: {
      findMany: (args: any) => Promise<any[]>
      findUnique: (args: any) => Promise<any>
      count: (args: any) => Promise<number>
      create: (args: any) => Promise<any>
      update: (args: any) => Promise<any>
      delete: (args: any) => Promise<any>
    }

    game: {
      findUnique: (args: any) => Promise<any>
      create: (args: any) => Promise<any>
      upsert: (args: any) => Promise<any>
    }

    category: {
      findMany: (args: any) => Promise<any[]>
    }

    like: {
      create: (args: any) => Promise<any>
      delete: (args: any) => Promise<any>
      findUnique: (args: any) => Promise<any>
    }

    gateway: {
      findMany: (args: any) => Promise<any[]>
      findUnique: (args: any) => Promise<any>
      create: (args: any) => Promise<any>
      update: (args: any) => Promise<any>
      delete: (args: any) => Promise<any>
    }

    supportRequest: {
      create: (args: any) => Promise<any>
      findUnique: (args: any) => Promise<any>
      update: (args: any) => Promise<any>
    }

    $transaction: <T>(operations: Promise<T>[]) => Promise<T[]>
  }
}
