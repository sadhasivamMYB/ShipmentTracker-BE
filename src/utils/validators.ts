import { z } from "zod";

export const UpdateSummarySchema = z.object({
    invoiceDate: z.string().optional().nullable(),
    fiInvoiceNumber: z.string().optional().nullable(),
    fiInvoiceDate: z.string().optional().nullable(),
    fiDuePaymentDate: z.string().optional().nullable(),
    fiInvoiceLineItemTotal: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiFreight: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiInvoiceTotal: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    insuranceNaicomId: z.string().optional().nullable(),
    insuranceDateOfIssue: z.string().optional().nullable(),
    insurancePremiumAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    insuranceDeclaredCertNo: z.string().optional().nullable(),
    blReference: z.string().optional().nullable(),
    exportPfiNumber: z.string().optional().nullable(),
    eleV8Code: z.string().optional().nullable(),
    exportInsuranceDateOfIssue: z.string().optional().nullable(),
    exportInsuranceDeclaredCertNo: z.string().optional().nullable(),
    exportInsurancePremiumAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    baNumber: z.string().optional().nullable(),
    formNumber: z.string().optional().nullable(),
    paarNumber: z.string().optional().nullable(),
    exportAssessmentAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    exportAssessmentCno: z.string().optional().nullable(),
});
