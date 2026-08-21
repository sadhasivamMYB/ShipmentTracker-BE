import { z } from "zod";

export const UpdateSummarySchema = z.object({
    pfiDate: z.string().optional().nullable(),
    fiInvoiceNumber: z.string().optional().nullable(),
    fiInvoiceDate: z.string().optional().nullable(),
    fiDuePaymentDate: z.string().optional().nullable(),
    pfiFOB: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    pfiFreight: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    pfiTotal: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiFob: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiFreight: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiTotal: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiNetWeight: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    fiGrossWeight: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    naicomId: z.string().optional().nullable(),
    iiDateOfIssue: z.string().optional().nullable(),
    iiPremiumAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    iiDeclaredCertNo: z.string().optional().nullable(),
    blNumber: z.string().optional().nullable(),
    exportEleV8Code: z.string().optional().nullable(),
    exportInsuranceDateOfIssue: z.string().optional().nullable(),
    exportInsuranceDeclaredCertNo: z.string().optional().nullable(),
    exportInsurancePremiumAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    bankApplicationNumber: z.string().optional().nullable(),
    formNumber: z.string().optional().nullable(),
    paarNumber: z.string().optional().nullable(),
    dutyAmount: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().optional()
    ),
    AssessmentNumber: z.string().optional().nullable(),
});
