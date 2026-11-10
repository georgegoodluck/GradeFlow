// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// HTTP driver: fast for reads, does NOT support interactive transactions
const appSql = neon(process.env.DATABASE_URL!);
export const db = drizzle(appSql, { schema });

// WebSocket driver: supports transactions, used for Auth and score submission
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const authDb = drizzleWs(pool, { schema });
