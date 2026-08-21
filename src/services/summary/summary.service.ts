import { db } from "../../config/database";
import { ProductLists, paarProducts } from "../../database/schema";
import { summary } from "../../database/schema/summary/summary.schema";
import { eq, ilike, like, or, getTableColumns, inArray } from "drizzle-orm";

export class SummaryService {
    static async getWorkspaceSummary(workspaceId: number | null, search?: string) {
        let conditions;

        if (search && search.trim() !== '') {
            // If there is a search keyword, ignore the workspace and return only matching data
            conditions = or(
                ilike(summary.pfiNumber, `%${search}%`),
                ilike(summary.blNumber, `%${search}%`)
            );
        } else if (workspaceId && !Number.isNaN(workspaceId)) {
            // Default: use the workspaceId
            conditions = eq(summary.workspaceId, workspaceId);
        } else {
            // No valid search and no valid workspaceId, return empty array
            return [];
        }

        const workspaceSummaries = await db.select().from(summary).where(conditions);

        if (workspaceSummaries.length === 0) return [];

        // Map them to the frontend's expected format
        const formattedSummary = workspaceSummaries.map(row => {
            const { id, workspaceId, createdAt, updatedAt, ...rest } = row;

            // Ensure any null values are passed as null so the frontend can handle the `-` fallback
            return {
                id,
                ...rest
            };
        });

        return formattedSummary;
    }

    static async exportToExcel(workspaceId: number) {

        try {


            const summaries = await db.select().from(summary).where(eq(summary.workspaceId, workspaceId));

            const pfiNumbers = summaries.map(s => s.pfiNumber).filter(Boolean) as string[];
            const paarNumbers = summaries.map(s => s.paarNumber).filter(Boolean) as string[];

            let allProducts: any[] = [];
            if (pfiNumbers.length > 0) {
                allProducts = await db.select().from(ProductLists).where(inArray(ProductLists.productPfiId, pfiNumbers));
            }

            let allPaarProducts: any[] = [];
            if (paarNumbers.length > 0) {
                allPaarProducts = await db.select().from(paarProducts).where(inArray(paarProducts.paarNumberRef, paarNumbers));
            }

            const exportedData: any[] = [];
            const toNumber = (val: any) => (val && !isNaN(Number(val))) ? Number(val) : null;

            for (const sumRow of summaries) {
                const prods = allProducts.filter(p => p.productPfiId === sumRow.pfiNumber);
                const pProds = allPaarProducts.filter(p => p.paarNumberRef === sumRow.paarNumber);

                const maxRows = Math.max(1, prods.length, pProds.length);

                for (let i = 0; i < maxRows; i++) {
                    const isFirstPfiRow = (i === 0);
                    const prod = prods[i] || {};
                    const pProd = pProds[i] || {};

                    exportedData.push({
                        ...sumRow,
                        workspaceId: null,
                        pfiNumber: isFirstPfiRow ? sumRow.pfiNumber : null,
                        pfiDate: isFirstPfiRow ? sumRow.pfiDate : null,
                        pfiFOB: isFirstPfiRow ? toNumber(sumRow.pfiFOB) : null,
                        pfiFreight: isFirstPfiRow ? toNumber(sumRow.pfiFreight) : null,
                        pfiTotal: isFirstPfiRow ? toNumber(sumRow.pfiTotal) : null,

                        insuranceDateOfIssue: isFirstPfiRow ? sumRow.iiDateOfIssue : null,
                        insuranceNaicomId: isFirstPfiRow ? sumRow.naicomId : null,
                        insurancePremiumAmount: isFirstPfiRow ? toNumber(sumRow.iiPremiumAmount) : null,
                        insuranceDeclaredCertNo: isFirstPfiRow ? sumRow.iiDeclaredCertNo : null,

                        //Fi
                        fiInvoiceNumber: isFirstPfiRow ? sumRow.fiInvoiceNumber : null,
                        fiInvoiceDate: isFirstPfiRow ? sumRow.fiInvoiceDate : null,
                        fiDuePaymentDate: isFirstPfiRow ? sumRow.fiDuePaymentDate : null,
                        fiInvoiceLineItemTotal: isFirstPfiRow ? toNumber(sumRow.fiFob) : null,
                        fiFreight: isFirstPfiRow ? toNumber(sumRow.fiFreight) : null,
                        fiInvoiceTotal: isFirstPfiRow ? toNumber(sumRow.fiTotal) : null,
                        fiNetWeight: isFirstPfiRow ? toNumber(sumRow.fiNetWeight) : null,
                        fiGrossWeight: isFirstPfiRow ? toNumber(sumRow.fiGrossWeight) : null,
                        fiFob: isFirstPfiRow ? toNumber(sumRow.fiFob) : null,
                        fiTotal: isFirstPfiRow ? toNumber(sumRow.fiTotal) : null,

                        //BL
                        blReference: isFirstPfiRow ? sumRow.blNumber : null,

                        //Export PFI
                        eleV8Code: isFirstPfiRow ? sumRow.exportEleV8Code : null,

                        //Export Insurance
                        exportInsuranceDateOfIssue: isFirstPfiRow ? sumRow.exportInsuranceDateOfIssue : null,
                        exportInsuranceDeclaredCertNo: isFirstPfiRow ? sumRow.exportInsuranceDeclaredCertNo : null,
                        exportInsurancePremiumAmount: isFirstPfiRow ? toNumber(sumRow.exportInsurancePremiumAmount) : null,

                        //Form M
                        formNumber: isFirstPfiRow ? sumRow.formNumber : null,

                        //PAAR
                        paarNumber: isFirstPfiRow ? sumRow.paarNumber : null,

                        //Export Assessment
                        AssessmentNumber: isFirstPfiRow ? sumRow.AssessmentNumber : null,
                        AssessmentDate: isFirstPfiRow ? sumRow.AssessmentDate : null,
                        DutyAmount: isFirstPfiRow ? toNumber(sumRow.dutyAmount) : null,

                        // Products mapped per row
                        productCode: prod.productCode || null,
                        productName: prod.productName || null,
                        FI_productQty: prod.fi_qty ? toNumber(prod.fi_qty) : null,
                        FI_productPrice: prod.fi_netPrice ? toNumber(prod.fi_netPrice) : null,
                        PFI_productQty: prod.pfi_qty ? toNumber(prod.pfi_qty) : null,
                        PFI_productPrice: prod.pfi_netPrice ? toNumber(prod.pfi_netPrice) : null,

                        // PAAR Products mapped per row
                        paarProductName: pProd.productName || null,
                        paarProductQty: pProd.productQuantity ? toNumber(pProd.productQuantity) : null,
                    });
                }
            }

            return exportedData;


        }
        catch (err) {

            console.log(err)
        }
    }

    static async getSelectedRowData(pfi: string) {
        const rowData = await db.select().from(ProductLists).where(eq(ProductLists.productPfiId, pfi));
        return rowData;
    }
    static async getPaarProductsRowData(paar: string) {

        const rowData = await db.select().from(paarProducts).where(eq(paarProducts.paarNumberRef, paar));
        return rowData;
    }

    static async updateSummaryData(pfi: string, data: any) {
        const [updatedSummary] = await db
            .update(summary)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(summary.pfiNumber, pfi))
            .returning();

        if (!updatedSummary) {
            throw new Error(`Summary row with PFI ${pfi} not found`);
        }
        return updatedSummary;
    }
}
