CREATE TABLE IF NOT EXISTS "too_many_logins_token" (
	"user_id" varchar(15) NOT NULL,
	"token" varchar(63) PRIMARY KEY NOT NULL,
	"expires" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_out" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "time_out" ADD COLUMN "attempts" smallint;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "too_many_logins_token" ADD CONSTRAINT "too_many_logins_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
