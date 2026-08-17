export function parseToDecimal(value: any): string | null {
    if (!value) return null;
    
    // Convert to string and remove all non-numeric characters except dots and minus
    const cleanStr = String(value).replace(/[^0-9.-]+/g, "");
    
    if (!cleanStr || cleanStr === "." || cleanStr === "-") return null;

    // Convert to float
    const floatValue = parseFloat(cleanStr);
    
    if (isNaN(floatValue)) return null;

    // Return as string with 2 decimal places to be safe for DB decimal column
    return floatValue.toFixed(2);
}
