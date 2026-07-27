import { firstMatch, normalizeText } from './utils';

export function parseExportAssessment(extractedText: string): Record<string, string | null> {
    const text = normalizeText(extractedText);
    
    const exportPfiNumber = firstMatch(text, /EXPORT PFI NO:\s*([^\n]+)/i);
    const exportAssessmentAmount = firstMatch(text, /AMOUNT:\s*([^\n]+)/i);
    const exportAssessmentCno = firstMatch(text, /CNO:\s*([^\n]+)/i);

    return {
        exportPfiNumber, // The link key
        exportAssessmentAmount,
        exportAssessmentCno,
    };
}
