export function parseFormM(extractedText: any): Record<string, string | null> {

    console.log(extractedText, "EXTRACTED TEXT ")
    // const text = normalizeText(extractedText);

    // console.log(text, "TEXT")

    // const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);
    // const baNumber = firstMatch(text, /BA NO:\s*([^\n]+)/i);
    // const formNumber = firstMatch(text, /FORM NO:\s*([^\n]+)/i);

    const refElevCode = extractedText?.PFINO
    const bankApplicationNumber = extractedText?.BANKAPPLICATIONNO
    const formNumber = extractedText?.FORMMNO

    return {
        refElevCode: refElevCode || null,
        bankApplicationNumber: bankApplicationNumber || null,
        formNumber: formNumber || null,
    };
}
