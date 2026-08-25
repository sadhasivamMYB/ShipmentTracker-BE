export function parseSgd(extractedText: any): Record<string, string | null> {

    return {
        ref_paarNumber: extractedText?.PAARNUMBER,
        Assessment_No: extractedText?.SGDREGISTRATIONNO,
        Assessment_Date_Of_Issue: extractedText?.SGDREGISTRATIONDATE,
        Duty_Amount: extractedText?.TOTALPAYABLE,



    };
}
