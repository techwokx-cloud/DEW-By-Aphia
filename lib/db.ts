import { Pool } from "pg";

/**
 * Single shared Postgres connection pool for the whole app. Reads
 * DATABASE_URL from the environment — expected shape for a self-hosted
 * Postgres on the same VPS:
 *   postgresql://dew_app:PASSWORD@localhost:5432/dew
 *
 * Next.js can reload this module in dev, so we stash the pool on
 * globalThis to avoid opening a new pool (and leaking connections) on
 * every hot reload.
 */

declare global {
  // eslint-disable-next-line no-var
  var __dewPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env, e.g. postgresql://dew_app:PASSWORD@localhost:5432/dew"
    );
  }
  return new Pool({
    connectionString,
    // Self-hosted Postgres on the same box, not a public endpoint — no TLS needed.
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

let _pool: Pool | undefined = globalThis.__dewPgPool;

function getPool(): Pool {
  if (_pool) return _pool;
  _pool = createPool();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__dewPgPool = _pool;
  }
  return _pool;
}

/** Thin query helper so store modules don't each import Pool directly.
 * Connects lazily on first actual query — never at module import time —
 * so importing a store module (which Next.js does during build-time page
 * data collection, even for routes that are never called) doesn't require
 * DATABASE_URL to be set. */
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
