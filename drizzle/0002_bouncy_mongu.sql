CREATE TABLE IF NOT EXISTS "tier" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"allotted_concurrent_streams" integer NOT NULL,
	"allotted_concurrent_viewers" integer NOT NULL,
	"allotted_bitrate" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tier" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_tier_tier_id_fk" FOREIGN KEY ("tier") REFERENCES "tier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
