import { type NextRequest, NextResponse } from "next/server";
import { decryptStreamUrl } from "@/lib/streaming/obfuscate";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Resolves redirects (such as from Stremio addons: Torrentio, Comet, or TorBox requestdl)
 * on the server side so that the client never sees intermediate URLs with API keys.
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

async function handleStreamProxy(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("t");
    const isDownload =
        request.nextUrl.searchParams.get("download") === "1" || request.nextUrl.searchParams.get("dl") === "1";
    const filenameParam = request.nextUrl.searchParams.get("filename") || request.nextUrl.searchParams.get("fn");

    if (!token) {
        return new NextResponse("Missing stream token", { status: 400 });
    }

    const originalUrl = decryptStreamUrl(token);
    if (!originalUrl) {
        return new NextResponse("Invalid or expired stream token", { status: 400 });
    }

    try {
        const finalUrl = await resolveStreamUrl(originalUrl);

        // Forward Range headers for seeking in media players and resume in downloads
        const requestHeaders: Record<string, string> = {
            "User-Agent": "DebridUI",
        };
        const range = request.headers.get("range");
        if (range) {
            requestHeaders.range = range;
        }

        const isHead = request.method === "HEAD";
        const upstreamRes = await fetch(finalUrl, {
            method: isHead ? "HEAD" : "GET",
            headers: requestHeaders,
        });

        const responseHeaders = new Headers();
        const headersToForward = [
            "content-type",
            "content-length",
            "content-range",
            "accept-ranges",
            "content-disposition",
            "etag",
            "last-modified",
        ];

        for (const headerName of headersToForward) {
            const value = upstreamRes.headers.get(headerName);
            if (value) {
                responseHeaders.set(headerName, value);
            }
        }

        if (isDownload || filenameParam) {
            const filename = filenameParam || "video.mp4";
            responseHeaders.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
        }

        responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");

        if (isHead) {
            return new Response(null, {
                status: upstreamRes.status,
                headers: responseHeaders,
            });
        }

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Stream proxy error:", error);
        return new NextResponse("Failed to proxy stream", { status: 502 });
    }
}

export async function GET(request: NextRequest) {
    return handleStreamProxy(request);
}

export async function HEAD(request: NextRequest) {
    return handleStreamProxy(request);
}
