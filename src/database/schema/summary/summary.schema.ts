import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "../workspace/workspace.schema";

export const summary = pgTable("summary", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
    orderPfiNumber: varchar("order_pfi_number", { length: 100 }).notNull().unique(), // The root key
    
    // Order fields
    invoiceDate: varchar("invoice_date", { length: 100 }),
    productName: varchar("product_name", { length: 255 }),
    qty: varchar("qty", { length: 100 }),
    netPrice: varchar("net_price", { length: 100 }),
    
    // Insurance fields
    insuranceNaicomId: varchar("insurance_naicom_id", { length: 100 }),
    insuranceDateOfIssue: varchar("insurance_date_of_issue", { length: 100 }),
    insurancePremiumAmount: varchar("insurance_premium_amount", { length: 100 }),
    
    // BL fields
    blReference: varchar("bl_reference", { length: 100 }),
    
    // Export PFI fields
    exportPfiNumber: varchar("export_pfi_number", { length: 100 }),
    
    // Form M fields
    baNumber: varchar("ba_number", { length: 100 }),
    formNumber: varchar("form_number", { length: 100 }),
    
    // PAAR fields
    paarNumber: varchar("paar_number", { length: 100 }),
    
    // Export Assessment fields
    exportAssessmentAmount: varchar("export_assessment_amount", { length: 100 }),
    exportAssessmentCno: varchar("export_assessment_cno", { length: 100 }),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
