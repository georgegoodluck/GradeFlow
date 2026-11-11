import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Application client: uses restricted role (RLS active)
// We'll configure the restricted role connection string later via Neon console
const appSql = neon(process.env.DATABASE_URL!);
export const db = drizzle(appSql, { schema });

// Auth client: uses owner connection (bypasses RLS)
// For Phase 1, we temporarily use the same connection; Phase 2 will add a separate owner URL
const authSql = neon(process.env.DATABASE_URL!);
export const authDb = drizzle(authSql, { schema });
