import { firstMatch, normalizeText } from './utils';

export function parseFormM(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);
    
    const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);
    const baNumber = firstMatch(text, /BA NO:\s*([^\n]+)/i);
    const formNumber = firstMatch(text, /FORM NO:\s*([^\n]+)/i);

    return {
        exportPfiNumber, // The link key
        baNumber,
        formNumber,
    };
}
