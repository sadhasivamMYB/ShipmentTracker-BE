CREATE TYPE "public"."document_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "product_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_pfi_id" varchar(255),
	"product_code" varchar(255),
	"product_name" varchar(255),
	"pfi_qty" numeric(10, 2),
	"pfi_netPrice" numeric(10, 2),
	"fob_value" varchar(255),
	"fi_qty" numeric(10, 2),
	"fi_netPrice" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "document_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"field_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"document_code" varchar(50) NOT NULL,
	"description" varchar(255),
	"status" "document_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_types_name_unique" UNIQUE("name"),
	CONSTRAINT "document_types_document_code_unique" UNIQUE("document_code")
);
--> statement-breakpoint
CREATE TABLE "document_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"document_type_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"extracted_text" text,
	"reference_key" varchar(100),
	"reference_value" varchar(100),
	"status" varchar(50) DEFAULT 'uploaded' NOT NULL,
	"uploaded_by" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paar_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"paar_number_ref" varchar(255),
	"product_name" varchar(255),
	"product_quantity" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"pfi_number" varchar(225) NOT NULL,
	"pfi_date" varchar(225),
	"pfi_fob" numeric(15, 2),
	"pfi_freight" numeric(15, 2),
	"pfi_total" numeric(15, 2),
	"fi_invoice_number" varchar(225),
	"fi_invoice_date" varchar(225),
	"fi_due_payment_date" varchar(225),
	"fi_fob" numeric(15, 2),
	"fi_freight" numeric(15, 2),
	"fi_total" numeric(15, 2),
	"fi_net_weight" numeric(15, 2),
	"fi_gross_weight" numeric(15, 2),
	"naicom_id" varchar(225),
	"ii_date_of_issue" varchar(225),
	"ii_premium_amount" numeric(15, 2),
	"ii_declared_cert_no" varchar(225),
	"bl_number" varchar(225),
	"container_number" varchar(225),
	"seal_number" varchar(225),
	"export_eleV8Code" varchar(225),
	"export_insurance_date_of_issue" varchar(225),
	"export_insurance_declared_cert_no" varchar(225),
	"export_insurance_premium_amount" numeric(15, 2),
	"bank_application_number" varchar(225),
	"form_m_number" varchar(225),
	"paar_number" varchar(225),
	"paar_issued_date" varchar(225),
	"assessment_number" varchar(225),
	"assessment_date" varchar(225),
	"duty_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "summary_pfi_number_unique" UNIQUE("pfi_number")
);
--> statement-breakpoint
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
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"role" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"month" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_fields" ADD CONSTRAINT "document_fields_document_id_document_uploads_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summary" ADD CONSTRAINT "summary_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;