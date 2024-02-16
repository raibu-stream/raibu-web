CREATE TABLE IF NOT EXISTS "email_verification_code" (
	"user_id" varchar(15) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires" bigint NOT NULL,
	CONSTRAINT "email_verification_code_code_user_id_pk" PRIMARY KEY("code","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "error_log" (
	"error_id" varchar(64) PRIMARY KEY NOT NULL,
	"error" text NOT NULL,
	"error_date" timestamp DEFAULT now() NOT NULL,
	"expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_key" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"hashed_password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_token" (
	"user_id" varchar(15) NOT NULL,
	"token" varchar(63) PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "user_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"active_expires" bigint NOT NULL,
	"idle_expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "time_out" (
	"id" text PRIMARY KEY NOT NULL,
	"expires" bigint NOT NULL,
	"attempts" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "too_many_logins_token" (
	"user_id" varchar(15) NOT NULL,
	"token" varchar(63) PRIMARY KEY NOT NULL,
	"expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_email_verified" boolean NOT NULL,
	"is_locked" boolean NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification_code" ADD CONSTRAINT "email_verification_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_key" ADD CONSTRAINT "user_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_log" ADD CONSTRAINT "request_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "too_many_logins_token" ADD CONSTRAINT "too_many_logins_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
