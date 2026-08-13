import { parsePFI } from './pfi.parser';
import { parseInsurance } from './insurance.parser';
import { parseBl } from './bl.parser';
import { parseExportPfi } from './export_pfi.parser';
import { parseFormM } from './form_m.parser';
import { parsePaar } from './paar.parser';
import { parseExportAssessment } from './export_assessment.parser';
import { parseExportInsurance } from './exportInsurance.parser';

export const documentParsers: Record<string, (text: string) => Record<string, string | null>> = {
    'pfi': (text) => parsePFI(text, 'pfi'), // Import PFI
    'fi': (text) => parsePFI(text, 'fi'), // FI Document
    'iins': parseInsurance, // Import Insurance
    'bl': parseBl, // Import Bill of Lading
    'export_pfi': parseExportPfi, // Export PFI
    'eins': parseExportInsurance, // Export Insurance
    'form_m': parseFormM, // Form M
    'paar': parsePaar, // PAAR
    'export_assessment': parseExportAssessment, // Export Assessment
};
