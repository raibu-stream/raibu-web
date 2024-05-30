CREATE TABLE IF NOT EXISTS "customer" (
	"braintree_customer_id" text PRIMARY KEY NOT NULL,
	"id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"max_concurrent_streams" integer NOT NULL,
	"max_concurrent_viewers" integer NOT NULL,
	"max_bitrate" integer NOT NULL
);
--> statement-breakpoint
DROP TABLE "tier";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_tier_tier_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "customer" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer" ADD CONSTRAINT "customer_id_subscription_id_fk" FOREIGN KEY ("id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_customer_customer_braintree_customer_id_fk" FOREIGN KEY ("customer") REFERENCES "public"."customer"("braintree_customer_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "tier";