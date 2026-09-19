import crypto from "node:crypto";

function getSecretKey(): Buffer {
    const secret = process.env.BETTER_AUTH_SECRET || "flix-gurawa-streaming-secret-salt-2026";
    return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a raw streaming/download URL into an opaque URL-safe token.
 */
export function encryptStreamUrl(rawUrl: string): string {
    const key = getSecretKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const payload = JSON.stringify({
        url: rawUrl,
        createdAt: Date.now(),
    });

    const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Combine IV (12B) + Tag (16B) + Encrypted data
    const combined = Buffer.concat([iv, tag, encrypted]);
    return combined.toString("base64url");
}

/**
 * Decrypts an opaque token back to the original URL.
 */
export function decryptStreamUrl(token: string): string | null {
    try {
        const key = getSecretKey();
        const combined = Buffer.from(token, "base64url");

        if (combined.length < 28) return null; // 12 bytes IV + 16 bytes Tag

        const iv = combined.subarray(0, 12);
        const tag = combined.subarray(12, 28);
        const ciphertext = combined.subarray(28);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        const data = JSON.parse(decrypted.toString("utf8"));

        if (typeof data.url === "string") {
            return data.url;
        }
        return null;
    } catch {
        return null;
    }
}
