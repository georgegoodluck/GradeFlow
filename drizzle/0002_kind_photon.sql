ALTER TABLE "schools" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "terms" ADD COLUMN "session" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_slug_unique" UNIQUE("slug");