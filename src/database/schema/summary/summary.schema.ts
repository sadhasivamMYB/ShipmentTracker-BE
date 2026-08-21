import { pgTable, serial, varchar, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { workspaces } from "../workspace/workspace.schema";

export const summary = pgTable("summary", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),

    //PFI 
    pfiNumber: varchar("pfi_number", { length: 225 }).notNull().unique(), // The root key
    pfiDate: varchar("pfi_date", { length: 225 }),
    pfiFOB: decimal("pfi_fob", { precision: 15, scale: 2 }),
    pfiFreight: decimal("pfi_freight", { precision: 15, scale: 2 }),
    pfiTotal: decimal("pfi_total", { precision: 15, scale: 2 }),

    // FI fields
    fiInvoiceNumber: varchar("fi_invoice_number", { length: 225 }),
    fiInvoiceDate: varchar("fi_invoice_date", { length: 225 }),
    fiDuePaymentDate: varchar("fi_due_payment_date", { length: 225 }),
    fiFob: decimal("fi_fob", { precision: 15, scale: 2 }),
    fiFreight: decimal("fi_freight", { precision: 15, scale: 2 }),
    fiTotal: decimal("fi_total", { precision: 15, scale: 2 }),
    fiNetWeight: decimal("fi_net_weight", { precision: 15, scale: 2 }),
    fiGrossWeight: decimal("fi_gross_weight", { precision: 15, scale: 2 }),

    // Insurance fields
    naicomId: varchar("naicom_id", { length: 225 }),
    iiDateOfIssue: varchar("ii_date_of_issue", { length: 225 }),
    iiPremiumAmount: decimal("ii_premium_amount", { precision: 15, scale: 2 }),
    iiDeclaredCertNo: varchar("ii_declared_cert_no", { length: 225 }),
    // BL fields
    blNumber: varchar("bl_number", { length: 225 }),
    containerNumber: varchar("container_number", { length: 225 }),
    sealNumber: varchar("seal_number", { length: 225 }),


    // Export PFI fields
    exportEleV8Code: varchar("export_eleV8Code", { length: 225 }),


    // Export Insurance fields
    exportInsuranceDateOfIssue: varchar("export_insurance_date_of_issue", { length: 225 }),
    exportInsuranceDeclaredCertNo: varchar("export_insurance_declared_cert_no", { length: 225 }),
    exportInsurancePremiumAmount: decimal("export_insurance_premium_amount", { precision: 15, scale: 2 }),


    // Form M fields
    bankApplicationNumber: varchar("bank_application_number", { length: 225 }),
    formNumber: varchar("form_m_number", { length: 225 }),

    // PAAR fields
    paarNumber: varchar("paar_number", { length: 225 }),
    paarIssuedDate: varchar("paar_issued_date", { length: 225 }),

    // Export Assessment fields
    AssessmentNumber: varchar("assessment_number", { length: 225 }),
    AssessmentDate: varchar("assessment_date", { length: 225 }),
    dutyAmount: decimal("duty_amount"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
