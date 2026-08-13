import { firstMatch, normalizeText } from './utils';

export function parseFormM(extractedText: string): Record<string, string | null> {

    console.log(extractedText, "EXTRACTED TEXT ")
    // const text = normalizeText(extractedText);

    // console.log(text, "TEXT")

    // const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);
    // const baNumber = firstMatch(text, /BA NO:\s*([^\n]+)/i);
    // const formNumber = firstMatch(text, /FORM NO:\s*([^\n]+)/i);

    const exportPfiNumber = "100028023"
    const baNumber = "394094716"
    const formNumber = extractedText?.FORMMNO || ""


    return {
        exportPfiNumber, // The link key
        baNumber,
        formNumber,
    };
}
