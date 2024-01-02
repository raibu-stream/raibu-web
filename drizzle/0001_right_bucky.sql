CREATE TABLE IF NOT EXISTS "error_log" (
	"error_id" varchar(64) PRIMARY KEY NOT NULL,
	"error" text NOT NULL,
	"error_date" timestamp DEFAULT now() NOT NULL,
	"expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_log" (
	"user_id" varchar(15),
	"route_id" text NOT NULL,
	"request_method" varchar(8) NOT NULL,
	"latency_in_ns" bigint NOT NULL,
	"expires" bigint NOT NULL,
	"request_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "isEmailVerified" TO "is_email_verified";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "isLocked" TO "is_locked";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_log" ADD CONSTRAINT "request_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
