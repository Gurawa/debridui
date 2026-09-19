import { type NextRequest, NextResponse } from "next/server";
import { decryptStreamUrl } from "@/lib/streaming/obfuscate";

async function handleStreamRedirect(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("t");

    if (!token) {
        return new NextResponse("Missing stream token", { status: 400 });
    }

    const originalUrl = decryptStreamUrl(token);
    if (!originalUrl) {
        return new NextResponse("Invalid or expired stream token", { status: 400 });
    }

    // If it's a TorBox API requestdl link, resolve the redirect on the server
    // so the client receives the CDN URL directly without ever seeing the API token!
    if (originalUrl.includes("torbox.app") && originalUrl.includes("requestdl")) {
        try {
            const probe = await fetch(originalUrl, {
                method: "HEAD",
                redirect: "manual",
                headers: {
                    "User-Agent": "DebridUI",
                },
            });

            const cdnLocation = probe.headers.get("location");
            if (cdnLocation) {
                return NextResponse.redirect(cdnLocation, { status: 307 });
            }
        } catch {
            // Fallback to direct redirect if probe fails
        }
    }

    return NextResponse.redirect(originalUrl, { status: 307 });
}

export async function GET(request: NextRequest) {
    return handleStreamRedirect(request);
}

export async function HEAD(request: NextRequest) {
    return handleStreamRedirect(request);
}
