import { normalizeText, firstMatch, extractAfterLabel } from './utils';

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

export function parseExportInsurance(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);

    console.log(text, "Export Insurance")

    const dateOfIssue = firstMatch(text, /DATE OF ISSUE\s*:\s*([^\n]+)/i);
    const declaredCertNo = firstMatch(text, /DECLARED CERT NO\s*:\s*([^\n]+)/i)?.split(" ")[0] || "";
    const Elev8Code = firstMatch(text, /PROFORMA INVOICE NO\/DATE:\s*([^\n]+)/i)?.split(" ")[0] || "";

    console.log(Elev8Code)

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

    const premium = firstMatch(text, /PREMIUM\s*:\s*(?:NGN\s*)?([\d,]+\.\d{2})/i);

    return {
        refElevCode: Elev8Code.trim(), // The link key
        exportInsuranceDateOfIssue: dateOfIssue,
        exportInsuranceDeclaredCertNo: declaredCertNo.trim(),
        // naicomId: naicomId,
        // proformaInvoiceDate: proformaInvoiceDate,
        // EIsumInsured: sumInsured,
        exportInsurancePremiumAmount: premium,
        // EIexchangeRate: exchangeRate,
    };
}
