export function normalizeText(text: string) {
    return text
        .replace(/\r/g, "\n")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();
}

export function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function firstMatch(text: string, pattern: RegExp) {
    const match = text.match(pattern);
    return match?.[1]?.trim() || null;
}

export function extractAfterLabel(text: string, label: string) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
        if (lines[i]?.toLowerCase().includes(label.toLowerCase())) {
            const nextLine = lines[i + 1] || "";
            return nextLine.replace(/\s*\/\s*$/, "").trim();
        }
    }

    return null;
}
