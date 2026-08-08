CREATE TABLE "template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"file_path" text NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_field" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"field_name" text NOT NULL,
	"field_label" text NOT NULL,
	"field_type" text NOT NULL,
	"required" boolean NOT NULL,
	"default_value" text,
	"order" integer NOT NULL
);
