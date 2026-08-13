import { firstMatch, normalizeText } from './utils';

export function parsePaar(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);

    const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i) || "";
    const paarNumber = firstMatch(text, /PAAR NUMBER:\s*([^\n]+)/i) || ""

    return {
        exportPfiNumber: exportPfiNumber?.trim(),
        paarNumber: paarNumber?.trim()
    };
}
