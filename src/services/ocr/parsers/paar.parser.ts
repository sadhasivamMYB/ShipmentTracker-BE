import { firstMatch, normalizeText } from './utils';

export function parsePaar(extractedText: any): Record<string, string | null> {

    return {
        refElevCode: extractedText?.INVOICENO,
        paarNumber: extractedText?.PAARNUMBER,
        issuedDate: extractedText?.PAARISSUEDATE,
        GoodAndServices: extractedText?.ITEMS

    };
}
