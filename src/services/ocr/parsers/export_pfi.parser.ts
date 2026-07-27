import { firstMatch, normalizeText } from './utils';

export function parseExportPfi(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);
    
    // We expect both Order PFI Number (to link to order) and Export PFI Number (to become new parent)
    const pfiNumber = firstMatch(text, /ORDER PFI NO:\s*([^\n]+)/i);
    const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);

    return {
        pfiNumber, // Matches order
        exportPfiNumber, // Becomes link key for form_m, paar, assessment
    };
}
