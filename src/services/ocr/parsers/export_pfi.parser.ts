import { firstMatch, normalizeText } from './utils';

export function parseExportPfi(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);

    // We expect both Order PFI Number (to link to order) and Export PFI Number (to become new parent)
    const pfiNumber = firstMatch(text, /order Number:\s*([^\n]+)/i);
    const eleV8Code = firstMatch(text, /PFI No:\s*([^\n]+)/i)?.trim() || "";

    return {
        pfiNumber, // Matches order
        exportEleV8Code: eleV8Code, // Becomes link key for form_m, paar, assessment
    };
}
