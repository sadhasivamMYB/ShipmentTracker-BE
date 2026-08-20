import { z } from "zod";

const ALLOWED_DOCUMENT_CODES = ["PFI", "IINS", "BL", "EXPORT_PFI", "EINS", "FI", "PAAR", "FORM_M", "SGD"] as const;

export const CreateDocumentTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    documentCode: z.enum(ALLOWED_DOCUMENT_CODES, { message: "Document code must be one of: PFI, IINS, BL, EXPORT_PFI, EINS, FI, PAAR, FORM_M, SGD" }),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const UpdateDocumentTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    documentCode: z.enum(ALLOWED_DOCUMENT_CODES, { message: "Document code must be one of: PFI, IINS, BL, EXPORT_PFI, EINS, FI, PAAR, FORM_M, SGD" }),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]),
});
