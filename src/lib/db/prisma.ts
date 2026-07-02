import { PrismaClient } from "@prisma/client"

const databaseUrl = process.env.DATABASE_URL || ""
const isPrismaPostgres = databaseUrl.startsWith("prisma+postgres://") || databaseUrl.startsWith("prisma://")

// Declare ambient module globals at the top level (required by TypeScript)
declare global {
  var prismaGlobal: PrismaClient | undefined
}

let prisma: PrismaClient

if (isPrismaPostgres) {
  // 1. Connection configuration for Prisma Postgres (Accelerate)
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = new PrismaClient({
      accelerateUrl: databaseUrl,
    })
  }
  prisma = globalThis.prismaGlobal
} else {
  // 2. Connection configuration for direct PostgreSQL (Neon, local PG, etc.)
  const { PrismaPg } = require("@prisma/adapter-pg")
  const { Pool } = require("pg")

  if (!globalThis.prismaGlobal) {
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    globalThis.prismaGlobal = new PrismaClient({ adapter })
  }
  prisma = globalThis.prismaGlobal
}

export default prisma
