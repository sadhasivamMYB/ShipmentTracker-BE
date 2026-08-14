import { db } from "../../config/database";
import { ProductLists } from "../../database/schema";
import { summary } from "../../database/schema/summary/summary.schema";
import { eq, ilike, like, or, getTableColumns } from "drizzle-orm";

export class SummaryService {
    static async getWorkspaceSummary(workspaceId: number | null, search?: string) {
        let conditions;

        if (search && search.trim() !== '') {
            // If there is a search keyword, ignore the workspace and return only matching data
            conditions = or(
                ilike(summary.orderPfiNumber, `%${search}%`),
                ilike(summary.blReference, `%${search}%`)
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
            const { id, workspaceId, orderPfiNumber, createdAt, updatedAt, productName, qty, netPrice, ...rest } = row;

            // Reconstruct row with `pfiNumber` instead of `orderPfiNumber`
            // Ensure any null values are passed as null so the frontend can handle the `-` fallback
            return {
                id,
                pfiNumber: orderPfiNumber,
                ...rest
            };
        });

        return formattedSummary;
    }

    static async exportToExcel(workspaceId: number) {

        try {


            const ExportData = await db.select({
                ...getTableColumns(summary),
                productCode: ProductLists.productCode,
                productName: ProductLists.productName,
                FI_productQty: ProductLists.fi_qty,
                FI_productPrice: ProductLists.fi_netPrice,
                PFI_productQty: ProductLists.pfi_qty,
                PFI_productPrice: ProductLists.pfi_netPrice,
            }).from(summary)
                .innerJoin(ProductLists, eq(summary.orderPfiNumber, ProductLists.productPfiId)).where(eq(summary.workspaceId, workspaceId))

            const exportedData = ExportData?.map((row, index, array) => {
                const previousRow = array[index - 1];

                const isFirstPfiRow =
                    !previousRow ||
                    previousRow.orderPfiNumber !== row.orderPfiNumber;

                return {
                    ...row,
                    workspaceId: "",
                    orderPfiNumber: "",
                    PFI_NUMBER: isFirstPfiRow ? row?.orderPfiNumber : "",
                    insuranceDateOfIssue: isFirstPfiRow ? row.insuranceDateOfIssue : "",
                    insuranceNaicomId: isFirstPfiRow ? row?.insuranceNaicomId : "",
                    insurancePremiumAmount: isFirstPfiRow ? row?.insurancePremiumAmount : "",
                    insuranceDeclaredCertNo: isFirstPfiRow ? row?.insuranceDeclaredCertNo : "",

                    //Fi
                    fiInvoiceNumber: isFirstPfiRow ? row?.fiInvoiceNumber : "",
                    fiInvoiceDate: isFirstPfiRow ? row?.fiInvoiceDate : "",
                    fiDuePaymentDate: isFirstPfiRow ? row?.fiDuePaymentDate : "",
                    fiInvoiceLineItemTotal: isFirstPfiRow ? row?.fiInvoiceLineItemTotal : "",
                    fiFreight: isFirstPfiRow ? row?.fiFreight : "",
                    fiInvoiceTotal: isFirstPfiRow ? row?.fiInvoiceTotal : "",

                    //BL
                    blReference: isFirstPfiRow ? row?.blReference : "",

                    //Export PFI
                    exportPfiNumber: "",
                    eleV8Code: isFirstPfiRow ? row?.eleV8Code : "",

                    //Export Insurance
                    exportInsuranceDateOfIssue: isFirstPfiRow ? row?.exportInsuranceDateOfIssue : "",
                    exportInsuranceDeclaredCertNo: isFirstPfiRow ? row?.exportInsuranceDeclaredCertNo : "",
                    exportInsurancePremiumAmount: isFirstPfiRow ? row?.exportInsurancePremiumAmount : "",

                    //Form M
                    formNumber: isFirstPfiRow ? row?.formNumber : "",


                    //PAAR
                    paarNumber: isFirstPfiRow ? row?.paarNumber : "",

                    //Export Assessment
                    exportAssessmentAmount: isFirstPfiRow ? row?.exportAssessmentAmount : "",
                    exportAssessmentCno: isFirstPfiRow ? row?.exportAssessmentCno : "",

                    //Export PFI



                }
            })

            return exportedData


        }
        catch (err) {

            console.log(err)
        }
    }

    static async getSelectedRowData(pfi: string) {
        const rowData = await db.select().from(ProductLists).where(eq(ProductLists.productPfiId, pfi));
        return rowData;
    }
}
