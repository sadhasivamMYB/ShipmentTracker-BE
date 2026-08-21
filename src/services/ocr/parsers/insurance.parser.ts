import { normalizeText, firstMatch } from './utils';

export type InsuranceFields = {
    dateOfIssue: string | null;
    declaredCertNo: string | null;
    naicomId: string | null;
    proformaInvoiceNo: string | null;
    proformaInvoiceDate: string | null;
    sumInsured: string | null;
    premium: string | null;
    exchangeRate: string | null;
};

export function parseInsurance(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);

    const dateOfIssue = firstMatch(text, /DATE OF ISSUE\s*:\s*([^\n]+)/i);
    const declaredCertNo = firstMatch(text, /DECLARED CERT NO\s*:\s*([^\n]+)/i)?.split(" ")[0] || "";
    const naicomId = firstMatch(text, /NAICOM ID\s*:\s*([^\n]+)/i)?.trim() || "";

    let proformaLine = firstMatch(text, /PROFORMA INVOICE NO[\/\s]*DATE\s*:\s*([^\n]+)/i)
        || firstMatch(text, /PROFORMA INVOICE NO\.?\s*:\s*([^\n]+)/i)
        || firstMatch(text, /PROFORMA INVOICE\s*:\s*([^\n]+)/i)
        || firstMatch(text, /PFI NO\.?\s*:\s*([^\n]+)/i);

    let proformaInvoiceNo: string | null = null;
    let proformaInvoiceDate: string | null = null;

    if (proformaLine) {
        const m = proformaLine.match(/^([A-Z0-9\/\-]+)\s+Date:\s*(.+)$/i);
        if (m) {
            proformaInvoiceNo = m[1]?.trim() || "";
            proformaInvoiceDate = m[2]?.trim() || "";
        } else {
            proformaInvoiceNo = proformaLine.trim();
        }
    }

    const sumInsured = firstMatch(text, /SUM INSURED\s*:\s*(?:NGN\s*)?([\d,]+\.\d{2})/i);
    const premium = firstMatch(text, /PREMIUM\s*:\s*(?:NGN\s*)?([\d,]+\.\d{2})/i)?.trim() || "";
    const exchangeRate = firstMatch(text, /EXCHANGE RATE\s*:\s*-\s*([0-9.]+)/i);

    return {
        pfiNumber: proformaInvoiceNo, // The link key
        iiDateOfIssue: dateOfIssue,
        iiDeclaredCertNo: declaredCertNo?.trim(),
        naicomId: naicomId,
        // proformaInvoiceDate: proformaInvoiceDate,
        // sumInsured: sumInsured,
        iiPremiumAmount: premium,
        // exchangeRate: exchangeRate,
    };
}
