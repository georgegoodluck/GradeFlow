ALTER TABLE "schools" DROP CONSTRAINT "schools_slug_unique";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_code_unique" UNIQUE("code");