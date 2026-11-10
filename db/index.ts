import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// 1. Read the URL once
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from environment variables.");
}

// 2. HTTP driver: fast for reads
const appSql = neon(connectionString);
export const db = drizzle(appSql, { schema });

// 3. WebSocket driver: supports transactions (Auth & Score submission)
const pool = new Pool({ connectionString });
export const authDb = drizzleWs(pool, { schema });
