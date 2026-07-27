import { firstMatch, normalizeText } from './utils';

export function parsePaar(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);
    
    const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);
    const paarNumber = firstMatch(text, /PAAR NO:\s*([^\n]+)/i);

    return {
        exportPfiNumber, // The link key
        paarNumber,
    };
}
