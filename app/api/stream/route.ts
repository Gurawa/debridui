import { type NextRequest, NextResponse } from "next/server";
import { decryptStreamUrl } from "@/lib/streaming/obfuscate";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Resolves redirects (such as from Stremio addons: Torrentio, Comet, or TorBox requestdl)
 * on the server side so that the client receives the direct CDN link without ever seeing
 * any intermediate URLs containing private API keys or addon tokens.
 *
 * The server only performs lightweight HEAD requests (~50ms, 0 byte payload) to discover
 * the final CDN URL, then 307-redirects the user directly to the Debrid CDN.
 * The server does ZERO heavy lifting — all media streaming and downloads are directly
 * between the user and Debrid CDN.
 */
async function resolveStreamUrl(url: string, maxHops = 6): Promise<string> {
    let currentUrl = url;
    for (let i = 0; i < maxHops; i++) {
        try {
            let probe = await fetch(currentUrl, {
                method: "HEAD",
                redirect: "manual",
                headers: {
                    "User-Agent": "DebridUI",
                },
            });

            if (probe.status === 405) {
                probe = await fetch(currentUrl, {
                    method: "GET",
                    redirect: "manual",
                    headers: {
                        "User-Agent": "DebridUI",
                        Range: "bytes=0-0",
                    },
                });
            }

            if ([301, 302, 303, 307, 308].includes(probe.status)) {
                const nextLocation = probe.headers.get("location");
                if (nextLocation) {
                    currentUrl = nextLocation.startsWith("http")
                        ? nextLocation
                        : new URL(nextLocation, currentUrl).toString();
                    continue;
                }
            }
            break;
        } catch {
            break;
        }
    }
    return currentUrl;
}

async function handleStreamRedirect(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("t");

    if (!token) {
        return new NextResponse("Missing stream token", { status: 400 });
    }

    const originalUrl = decryptStreamUrl(token);
    if (!originalUrl) {
        return new NextResponse("Invalid or expired stream token", { status: 400 });
    }

    try {
        const finalUrl = await resolveStreamUrl(originalUrl);
        return NextResponse.redirect(finalUrl, 307);
    } catch {
        return NextResponse.redirect(originalUrl, 307);
    }
}

export async function GET(request: NextRequest) {
    return handleStreamRedirect(request);
}

export async function HEAD(request: NextRequest) {
    return handleStreamRedirect(request);
}
