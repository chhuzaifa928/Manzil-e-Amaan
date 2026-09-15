// lib/db.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
    var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL is not defined in your environment variables (.env.local).");
}

const isProduction = process.env.NODE_ENV === "production";
const isLocal = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1");

// Ensure pool is re-created if DATABASE_URL changes or was updated in .env.local
if (global._pgPool && (global._pgPool as any)._connectionString !== connectionString) {
    global._pgPool.end().catch(() => {});
    global._pgPool = undefined;
}

const pool =
    global._pgPool ||
    new Pool({
        connectionString,
        ssl: isLocal ? false : isProduction ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

(pool as any)._connectionString = connectionString;

if (!isProduction) {
    global._pgPool = pool;
}

export const db = {
    query: async <T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<QueryResult<T>> => {
        const start = Date.now();
        const res = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        if (!isProduction) {
            console.log(`[DB Query] Duration: ${duration}ms | Rows: ${res.rowCount}`);
        }
        return res;
    },
};