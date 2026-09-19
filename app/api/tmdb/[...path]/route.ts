import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "TMDB API key is not configured on the server." }, { status: 500 });
    }

    const { path } = await context.params;
    const subpath = path.join("/");

    // Forward existing query parameters and add private api_key
    const queryParams = new URLSearchParams(request.nextUrl.searchParams);
    queryParams.set("api_key", apiKey);

    const tmdbUrl = `https://api.themoviedb.org/3/${subpath}?${queryParams.toString()}`;

    try {
        const res = await fetch(tmdbUrl, {
            headers: {
                accept: "application/json",
            },
            next: { revalidate: 3600 }, // Cache on Next.js server for 1 hour
        });

        const data = await res.json();
        return NextResponse.json(data, {
            status: res.status,
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch from TMDB" },
            { status: 500 }
        );
    }
}
