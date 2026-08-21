import { extractAfterLabel, firstMatch } from './utils';

type InvoiceProduct = {
    productCode: string;
    productName: string;
    qty: string;
    uom?: string;
    price: string;
    netPrice: string;
    lineValue: string;
};

function parseInvoiceRow(row: string): InvoiceProduct | null {
    const match = row.match(
        /^(\d+)\s+(.+?)\s+([\d,]+)\s+([A-Z]+)\s+([\d.]+)\s+([\d.]+)\s+([\d,]+\.\d{2})$/
    );

    if (!match) return null;

    return {
        productCode: match[1]?.trim() || "",
        productName: match[2]?.trim() || "",
        qty: match[3]?.trim() || "",
        uom: match[4]?.trim() || "",
        price: match[5]?.trim() || "",
        netPrice: match[6]?.trim() || "",
        lineValue: match[7]?.trim() || "",
    };
}

function parseInvoiceRows(extractedText: string): InvoiceProduct[] {
    const header = "Product QTY UoM Price Net Price Line Value";

    const headerIndex = extractedText.indexOf(header);

    if (headerIndex === -1) {
        return [];
    }

    // Get everything after the Product table header
    const productSection = extractedText.slice(
        headerIndex + header.length
    );

    const lines = productSection
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const products: InvoiceProduct[] = [];

    for (const line of lines) {
        const product = parseInvoiceRow(line);

        if (product) {
            products.push(product);
        }
    }

    return products;
}

export function parsePFI(
    extractedText: string, type: string
): Record<string, any> {

    let typePFI = type == "fi" ? true : false



    console.log("ENTER IN PFI Parser ........  FI : ", typePFI, "............");

    const pfiOrderInvoiceStr = extractAfterLabel(
        extractedText,
        "Order Number Invoice Number Quotation Number"
    ) || extractAfterLabel(
        extractedText,
        "Order Number / Quotation Number"
    );

    let pfiNumber = null;
    let FI_invoiceNumber = null;

    if (pfiOrderInvoiceStr) {
        const parts = pfiOrderInvoiceStr.split("/").map((s: string) => s.trim());
        pfiNumber = parts[0] || null;
        if (parts.length > 1 && parts[1]) {
            FI_invoiceNumber = parts[1];
        }
    }

    if (typePFI && !pfiNumber) {
        // Fallback for FI if Order Number Invoice Number Quotation Number is missing
        const fallback = extractAfterLabel(extractedText, "Bill of Lading Number");
        if (fallback) {
            pfiNumber = fallback.split("/")[0]?.trim() || null;
        }
    }

    const invoiceDate = extractAfterLabel(extractedText, "Invoice Date")?.trim() || null;

    // Due Date of Payment
    const dueDateBlock = extractAfterLabel(extractedText, "Due Date of Payment");
    // e.g. "CI90 01.08.2026"
    let FI_duePaymentDate = null;
    if (dueDateBlock) {
        const parts = dueDateBlock.split(/\s+/);
        FI_duePaymentDate = parts.pop() || null;
    }

    // ⭐ Extract ALL products
    const products = parseInvoiceRows(extractedText);
    const invoiceLineItemTotal = firstMatch(
        extractedText,
        /Invoice Line Item Total USD\s*([\d,]+\.\d{2})/i
    );

    const freight = firstMatch(
        extractedText,
        /Freight USD\s*([\d,]+\.\d{2})/i
    );

    const invoiceTotal = firstMatch(
        extractedText,
        /Invoice Total USD\s*([\d,]+\.\d{2})/i
    );

    let fiNetWeight = null;
    let fiGrossWeight = null;

    if (typePFI) {
        const weightRegex = /Total Cube\(M3\)\s+([\d,]+)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)/i;
        const weightMatch = extractedText.match(weightRegex);
        if (weightMatch) {
            fiGrossWeight = weightMatch[2];
            fiNetWeight = weightMatch[3];
        }

        return {
            pfiNumber: pfiNumber,
            FI_invoiceNumber: FI_invoiceNumber,
            FI_invoiceDate: invoiceDate,
            FI_duePaymentDate: FI_duePaymentDate,
            FI_products: products,
            FI_invoiceLineItemTotal: invoiceLineItemTotal?.trim(),
            FI_freight: freight?.trim(),
            FI_invoiceTotal: invoiceTotal?.trim(),
            FI_netWeight: fiNetWeight,
            FI_grossWeight: fiGrossWeight,
        };
    } else {
        return {
            pfiNumber: pfiNumber,
            pfiDate: invoiceDate,
            products,
            pfiFOB: invoiceLineItemTotal?.trim(),
            pfiFreight: freight?.trim(),
            pfiTotal: invoiceTotal?.trim(),
        };
    }
}