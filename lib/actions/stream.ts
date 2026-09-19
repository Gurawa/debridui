"use server";

import { headers } from "next/headers";
import { encryptStreamUrl } from "@/lib/streaming/obfuscate";

export async function getObfuscatedStreamUrl(rawUrl: string): Promise<string> {
    if (!rawUrl || rawUrl.includes("/api/stream?token=")) {
        return rawUrl;
    }

    const token = encryptStreamUrl(rawUrl);
    let origin = process.env.NEXT_PUBLIC_APP_URL || "";

    try {
        const reqHeaders = await headers();
        const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
        if (host) {
            const proto = reqHeaders.get("x-forwarded-proto") || "https";
            origin = `${proto}://${host}`;
        }
    } catch {
        // Fallback to NEXT_PUBLIC_APP_URL or relative path
    }

    const path = `/api/stream?token=${encodeURIComponent(token)}`;
    return origin ? `${origin}${path}` : path;
}
