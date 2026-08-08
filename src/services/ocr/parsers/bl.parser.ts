import { firstMatch, normalizeText } from './utils';

export function parseBl(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);

    console.log(text, "❗❗❗❗🙌🙌✅✅✅")

    // Example logic for BL (adjust based on actual BL format later)
    const pfiNumber = firstMatch(text, /PFI NO:\s*([^\n]+)/i);
    const blReference = firstMatch(text, /B\/L NO:\s*([^\n]+)/i);

    return {
        pfiNumber, // The link key back to order
        blReference,
    };
}
