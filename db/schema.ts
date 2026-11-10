import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { crudPolicy, authenticatedRole } from "drizzle-orm/neon";
import { sql } from "drizzle-orm";

// Role enum for staff
export const staffRoleEnum = pgEnum("staff_role", [
  "owner",
  "admin",
  "teacher",
]);

// Schools (root tenant table — no school_id needed)
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Staff (has school_id, RLS via crudPolicy)
export const staff = pgTable(
  "staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: staffRoleEnum("role").notNull().default("teacher"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: sql`(select auth.user_id() = ${table.schoolId}::text)`,
      modify: sql`(select auth.user_id() = ${table.schoolId}::text)`,
    }),
  ],
);
