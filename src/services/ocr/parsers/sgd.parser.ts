export function parseSgd(extractedText: any): Record<string, string | null> {

    console.log(extractedText, "🔃🔃🔃🔃🏢")

    return {
        ref_paarNumber: "NG20260000549/TOT",
        Assessment_No: extractedText?.SGDREGISTRATIONNO,
        Assessment_Date_Of_Issue: extractedText?.SGDREGISTRATIONDATE,
        Duty_Amount: extractedText?.TOTALPAYABLE,



    };
}
