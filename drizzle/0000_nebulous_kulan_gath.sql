CREATE TABLE IF NOT EXISTS "email_verification_code" (
	"user" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "email_verification_code_code_user_pk" PRIMARY KEY("code","user")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "error_log" (
	"error_id" varchar(64) PRIMARY KEY NOT NULL,
	"error" text NOT NULL,
	"error_date" timestamp DEFAULT now() NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_token" (
	"user" varchar(255) NOT NULL,
	"token" varchar(63) PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_log" (
	"user" varchar(255),
	"route_id" text NOT NULL,
	"request_method" varchar(8) NOT NULL,
	"latency_in_ns" bigint NOT NULL,
	"expires" timestamp NOT NULL,
	"request_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "time_out" (
	"id" text PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL,
	"attempts" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "too_many_logins_token" (
	"user" varchar(255) NOT NULL,
	"token" varchar(63) PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"hashed_password" varchar(255) NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification_code" ADD CONSTRAINT "email_verification_code_user_user_email_fk" FOREIGN KEY ("user") REFERENCES "user"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_user_email_fk" FOREIGN KEY ("user") REFERENCES "user"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_log" ADD CONSTRAINT "request_log_user_user_email_fk" FOREIGN KEY ("user") REFERENCES "user"("email") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_user_email_fk" FOREIGN KEY ("user") REFERENCES "user"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "too_many_logins_token" ADD CONSTRAINT "too_many_logins_token_user_user_email_fk" FOREIGN KEY ("user") REFERENCES "user"("email") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
