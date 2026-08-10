CREATE TYPE "document_status" AS ENUM('active', 'inactive');
--> statement-breakpoint
ALTER TABLE "document_types" ADD COLUMN "document_code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "document_types" ADD COLUMN "status" "document_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "template_field" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "template_field" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "document_types" ADD CONSTRAINT "document_types_document_code_unique" UNIQUE("document_code");