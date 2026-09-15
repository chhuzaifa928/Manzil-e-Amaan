// lib/db.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
    // Prevent duplicate pool connections during Next.js Hot Module Reload (HMR)
    var _pgPool: Pool | undefined;
}

const pool =
    global._pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

if (process.env.NODE_ENV !== "production") {
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
        if (process.env.NODE_ENV === "development") {
            console.log(`[DB Query] Duration: ${duration}ms | Rows: ${res.rowCount}`);
        }
        return res;
    },
};