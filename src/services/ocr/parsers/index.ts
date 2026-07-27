import { parseOrder } from './order.parser';
import { parseInsurance } from './insurance.parser';
import { parseBl } from './bl.parser';
import { parseExportPfi } from './export_pfi.parser';
import { parseFormM } from './form_m.parser';
import { parsePaar } from './paar.parser';
import { parseExportAssessment } from './export_assessment.parser';

export const documentParsers: Record<string, (text: string) => Record<string, string | null>> = {
    'order': parseOrder,
    'insurance': parseInsurance,
    'bl': parseBl,
    'export_pfi': parseExportPfi,
    'form_m': parseFormM,
    'paar': parsePaar,
    'export_assessment': parseExportAssessment,
};
