import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

void prisma.$connect().catch(() => {
  // Neon free compute sleeps. The next query retries the wake-up.
});

export type Db = PrismaClient | Prisma.TransactionClient;

const DEFAULT_TX = { maxWait: 15_000, timeout: 20_000 };

function isTransient(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1008", "P1017", "P2024", "P2028", "P2034"].includes(
      error.code,
    );
  }
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return /timeout|closed the connection|ECONNRESET|Can't reach database|Server has closed|Transaction already closed/i.test(
      error.message,
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return /timeout|closed the connection|ECONNRESET|Can't reach database|Server has closed|Transaction already closed/i.test(
    message,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isTransient(error)) throw error;
    await sleep(600);
    return fn();
  }
}

export async function runTransaction<T>(
  fn: (db: Prisma.TransactionClient) => Promise<T>,
  options?: { timeout?: number; maxWait?: number },
): Promise<T> {
  const settings = { ...DEFAULT_TX, ...options };
  try {
    return await prisma.$transaction(fn, settings);
  } catch (error) {
    if (!isTransient(error)) throw error;
    await sleep(600);
    return prisma.$transaction(fn, settings);
  }
}
