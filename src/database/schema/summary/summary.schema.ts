import { pgTable, serial, varchar, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { workspaces } from "../workspace/workspace.schema";

export const summary = pgTable("summary", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
    orderPfiNumber: varchar("order_pfi_number", { length: 225 }).notNull().unique(), // The root key

    // Order fields
    invoiceDate: varchar("invoice_date", { length: 225 }),
    // productName: varchar("product_name", { length: 255 }),
    // qty: varchar("qty", { length: 225 }),
    // netPrice: varchar("net_price", { length: 225 }),

    // FI fields
    fiInvoiceNumber: varchar("fi_invoice_number", { length: 225 }),
    fiInvoiceDate: varchar("fi_invoice_date", { length: 225 }),
    fiDuePaymentDate: varchar("fi_due_payment_date", { length: 225 }),
    fiInvoiceLineItemTotal: decimal("fi_invoice_line_item_total", { precision: 15, scale: 2 }),
    fiFreight: decimal("fi_freight", { precision: 15, scale: 2 }),
    fiInvoiceTotal: decimal("fi_invoice_total", { precision: 15, scale: 2 }),

    // Insurance fields
    insuranceNaicomId: varchar("insurance_naicom_id", { length: 225 }),
    insuranceDateOfIssue: varchar("insurance_date_of_issue", { length: 225 }),
    insurancePremiumAmount: decimal("insurance_premium_amount", { precision: 15, scale: 2 }),
    insuranceDeclaredCertNo: varchar("insurance_declared_cert_no", { length: 225 }),
    // BL fields
    blReference: varchar("bl_reference", { length: 225 }),

    // Export PFI fields
    exportPfiNumber: varchar("export_pfi_number", { length: 225 }),
    eleV8Code: varchar("eleV8Code", { length: 225 }),


    // Export Insurance fields
    exportInsuranceDateOfIssue: varchar("export_insurance_date_of_issue", { length: 225 }),
    exportInsuranceDeclaredCertNo: varchar("export_insurance_declared_cert_no", { length: 225 }),
    exportInsurancePremiumAmount: decimal("export_insurance_premium_amount", { precision: 15, scale: 2 }),


    // Form M fields
    baNumber: varchar("ba_number", { length: 225 }),
    formNumber: varchar("form_number", { length: 225 }),

    // PAAR fields
    paarNumber: varchar("paar_number", { length: 225 }),

    // Export Assessment fields
    exportAssessmentAmount: decimal("export_assessment_amount", { precision: 15, scale: 2 }),
    exportAssessmentCno: varchar("export_assessment_cno", { length: 225 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
