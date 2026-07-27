import { extractAfterLabel, normalizeText, firstMatch } from './utils';

function parseInvoiceRow(row: string) {
    const match = row.match(
        /^(\d+)\s+(.+?)\s+([\d,]+)\s+([A-Z]+)\s+([\d.]+)\s+([\d.]+)\s+([\d,]+\.\d{2})$/
    );

    if (!match) return null;

    return {
        id: match[1],
        productName: match[2].trim(),
        qty: match[3],
        uom: match[4],
        price: match[5],
        netPrice: match[6],
        lineValue: match[7],
    };
}

export function parseOrder(extractedText: string): Record<string, string | null> {

    console.log("ENTER IN ORDER ....................")
    console.log("ORDER TEXT: ", extractedText)

    const PFINumberFull = extractAfterLabel(
        extractedText,
        "Order Number Invoice Number Quotation Number"
    );
    let pfiNumber = PFINumberFull?.split('/')[0]?.trim() || null;

    const invoiceDate = extractAfterLabel(extractedText, "Invoice Date");

    const productLine = extractAfterLabel(extractedText, "Product QTY UoM Price Net Price Line Value");
    const product = productLine ? parseInvoiceRow(productLine) : null;

    const invoiceLineItemTotal = firstMatch(extractedText, /Invoice Line Item Total USD\s*([\d,]+\.\d{2})/i);
    const invoiceTotal = firstMatch(extractedText, /Invoice Total USD\s*([\d,]+\.\d{2})/i);

    return {
        pfiNumber,
        invoiceDate,
        productName: product?.productName || null,
        qty: product?.qty || null,
        netPrice: product?.netPrice || null,
        invoiceLineItemTotal,
        invoiceTotal,
    };
}
