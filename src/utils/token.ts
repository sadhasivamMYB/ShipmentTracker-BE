import crypto from "crypto";

export const generateSecureToken = (): { rawToken: string; tokenHash: string } => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    return { rawToken, tokenHash };
};

export const hashToken = (rawToken: string): string => {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
};
