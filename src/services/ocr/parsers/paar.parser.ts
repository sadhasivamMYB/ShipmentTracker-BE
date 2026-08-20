import { firstMatch, normalizeText } from './utils';

export function parsePaar(extractedText: any): Record<string, string | null> {

    console.log(extractedText, "🔃🔃🔃🔃🏢")

    return {
        refElevCode: "ELEV8-SPIRIT202600024",
        paarNumber: extractedText?.PAARNUMBER,
        issuedDate: extractedText?.PAARISSUEDATE,
        GoodAndServices: extractedText?.ITEMS

    };
}
