// Base types for media display (shared by TMDB, Stremio addons, etc.)
export interface MediaIds {
    slug?: string;
    imdb?: string;
    tmdb?: number;
    trakt?: number;
    tvdb?: number;
}

export interface MediaImages {
    poster?: string[];
    fanart?: string[];
    banner?: string[];
    logo?: string[];
    clearart?: string[];
    thumb?: string[];
    headshot?: string[];
    screenshot?: string[];
}

export interface Media {
    title: string;
    year?: number;
    ids?: MediaIds;
    images?: MediaImages;
    rating?: number;
    genres?: string[];
    overview?: string;
}

export interface MediaItem {
    movie?: Media;
    show?: Media;
}

export interface TraktIds extends MediaIds {
    trakt: number;
    slug: string;
    tvdb?: number;
    tmdb: number;
}

export type TraktImages = MediaImages;

export interface TraktMedia extends Media {
    year: number;
    ids?: TraktIds;
    images?: TraktImages;
    votes?: number;
    runtime?: number;
    language?: string;
    country?: string;
    trailer?: string;
    homepage?: string;
    status?: string;
    aired_episodes?: number;
    certification?: string;
}

// Aliases for clean migration
export type TMDBMedia = TraktMedia;

export interface TraktSeason {
    number: number;
    ids: TraktIds;
    images?: TraktImages;
    title?: string;
    overview?: string;
    rating?: number;
    votes?: number;
    episode_count?: number;
    aired_episodes?: number;
    first_aired?: string;
}

export type TMDBSeason = TraktSeason;

export interface TraktEpisode {
    season: number;
    number: number;
    title: string;
    ids: TraktIds;
    images?: TraktImages;
    number_abs?: number;
    overview?: string;
    first_aired?: string; // ISO date
    updated_at?: string; // ISO date
    rating?: number;
    votes?: number;
    comment_count?: number;
    available_translations?: string[];
    runtime?: number;
    episode_type?: string;
    original_title?: string;
}

export type TMDBEpisode = TraktEpisode;

export interface TraktPerson {
    name: string;
    ids: TraktIds;
    images?: Pick<TraktImages, "headshot" | "fanart">;
}

export interface TraktPersonFull extends TraktPerson {
    social_ids?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        wikipedia?: string;
    };
    biography?: string;
    birthday?: string;
    death?: string;
    birthplace?: string;
    homepage?: string;
    gender?: string;
    known_for_department?: string;
}

export interface TraktPersonMovieCredit {
    characters?: string[];
    jobs?: string[];
    movie: TraktMedia;
}

export interface TraktPersonShowCredit {
    characters?: string[];
    jobs?: string[];
    episode_count?: number;
    series_regular?: boolean;
    show: TraktMedia;
}

export interface TraktPersonMovieCredits {
    cast?: TraktPersonMovieCredit[];
    crew?: {
        production?: TraktPersonMovieCredit[];
        art?: TraktPersonMovieCredit[];
        crew?: TraktPersonMovieCredit[];
        "costume & make-up"?: TraktPersonMovieCredit[];
        directing?: TraktPersonMovieCredit[];
        writing?: TraktPersonMovieCredit[];
        sound?: TraktPersonMovieCredit[];
        camera?: TraktPersonMovieCredit[];
        editing?: TraktPersonMovieCredit[];
        "visual effects"?: TraktPersonMovieCredit[];
    };
}

export interface TraktPersonShowCredits {
    cast?: TraktPersonShowCredit[];
    crew?: {
        production?: TraktPersonShowCredit[];
        art?: TraktPersonShowCredit[];
        crew?: TraktPersonShowCredit[];
        "costume & make-up"?: TraktPersonShowCredit[];
        directing?: TraktPersonShowCredit[];
        writing?: TraktPersonShowCredit[];
        sound?: TraktPersonShowCredit[];
        camera?: TraktPersonShowCredit[];
        editing?: TraktPersonShowCredit[];
        "visual effects"?: TraktPersonShowCredit[];
        "created by"?: TraktPersonShowCredit[];
    };
}

export interface TraktCastMember {
    characters: string[];
    person: TraktPerson;
    episode_count?: number;
}

export interface TraktCrewMember {
    jobs?: string[];
    job?: string[];
    person: TraktPerson;
}

export interface TraktCrew {
    production?: TraktCrewMember[];
    art?: TraktCrewMember[];
    crew?: TraktCrewMember[];
    "costume & make-up"?: TraktCrewMember[];
    directing?: TraktCrewMember[];
    writing?: TraktCrewMember[];
    sound?: TraktCrewMember[];
    camera?: TraktCrewMember[];
    directors?: TraktCrewMember[];
    writers?: TraktCrewMember[];
}

export interface TraktCastAndCrew {
    cast: TraktCastMember[];
    crew: TraktCrew;
}

export interface TraktMediaItem extends MediaItem {
    movie?: TraktMedia;
    show?: TraktMedia;
    watchers?: number;
    plays?: number;
    collected?: number;
    collectors?: number;
}

export interface TraktSearchResult {
    type: "movie" | "show" | "episode" | "person";
    score: number;
    movie?: TraktMedia;
    show?: TraktMedia;
}

export type TraktIdType = "tmdb" | "imdb" | "tvdb" | "trakt";

// TMDB Episode Group Types
export interface TMDBEpisodeGroupNetwork {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
}

export interface TMDBEpisodeGroupResult {
    description: string;
    episode_count: number;
    group_count: number;
    id: string;
    name: string;
    network: TMDBEpisodeGroupNetwork | null;
    type: number;
}

export interface TMDBEpisodeGroupsResponse {
    results: TMDBEpisodeGroupResult[];
    id: number;
}

export interface TMDBEpisodeGroupEpisode {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number | null;
    season_number: number;
    show_id: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
    order: number;
}

export interface TMDBEpisodeGroupGroup {
    id: string;
    name: string;
    order: number;
    episodes: TMDBEpisodeGroupEpisode[];
    locked: boolean;
}

export interface TMDBEpisodeGroupDetails {
    description: string;
    episode_count: number;
    group_count: number;
    groups: TMDBEpisodeGroupGroup[];
    id: string;
    name: string;
    network: TMDBEpisodeGroupNetwork | null;
    type: number;
}

export interface TMDBClientConfig {
    apiKey?: string;
    baseUrl?: string;
    apiVersion?: string;
}

export class TMDBError extends Error {
    constructor(
        message: string,
        public status?: number,
        public endpoint?: string
    ) {
        super(message);
        this.name = "TMDBError";
    }
}

// Helpers for TMDB Image URLs
export function tmdbImageUrl(path?: string | null, size: "w500" | "original" | "w1280" = "w500"): string | undefined {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `https://image.tmdb.org/t/p/${size}${path.startsWith("/") ? path : `/${path}`}`;
}

// biome-ignore lint/suspicious/noExplicitAny: TMDB raw response mapping
function mapRawMovieToMedia(m: any): TraktMedia {
    const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
    const imdbId = m.external_ids?.imdb_id || m.imdb_id;
    const certification = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === "US")?.release_dates?.[0]
        ?.certification;

    return {
        title: m.title || m.original_title || "",
        year: Number.isNaN(year) ? 0 : year,
        ids: {
            trakt: m.id,
            slug: String(m.id),
            tmdb: m.id,
            imdb: imdbId || undefined,
        },
        images: {
            poster: m.poster_path ? [tmdbImageUrl(m.poster_path, "w500")!] : [],
            fanart: m.backdrop_path ? [tmdbImageUrl(m.backdrop_path, "original")!] : [],
        },
        rating: typeof m.vote_average === "number" ? Math.round(m.vote_average * 10) / 10 : undefined,
        votes: m.vote_count,
        runtime: m.runtime,
        language: m.original_language,
        overview: m.overview || "",
        genres: m.genres ? m.genres.map((g: any) => g.name) : [],
        status: m.status,
        certification: certification || undefined,
        homepage: m.homepage || undefined,
    };
}

// biome-ignore lint/suspicious/noExplicitAny: TMDB raw response mapping
function mapRawShowToMedia(s: any): TraktMedia {
    const year = s.first_air_date ? new Date(s.first_air_date).getFullYear() : 0;
    const imdbId = s.external_ids?.imdb_id || s.imdb_id;
    const certification = s.content_ratings?.results?.find((r: any) => r.iso_3166_1 === "US")?.rating;

    return {
        title: s.name || s.original_name || "",
        year: Number.isNaN(year) ? 0 : year,
        ids: {
            trakt: s.id,
            slug: String(s.id),
            tmdb: s.id,
            imdb: imdbId || undefined,
        },
        images: {
            poster: s.poster_path ? [tmdbImageUrl(s.poster_path, "w500")!] : [],
            fanart: s.backdrop_path ? [tmdbImageUrl(s.backdrop_path, "original")!] : [],
        },
        rating: typeof s.vote_average === "number" ? Math.round(s.vote_average * 10) / 10 : undefined,
        votes: s.vote_count,
        language: s.original_language,
        overview: s.overview || "",
        genres: s.genres ? s.genres.map((g: any) => g.name) : [],
        status: s.status,
        aired_episodes: s.number_of_episodes,
        certification: certification || undefined,
        homepage: s.homepage || undefined,
    };
}

export class TMDBClient {
    private readonly baseUrl: string;
    private apiKey?: string;
    private readonly apiVersion: string;

    constructor(config: TMDBClientConfig = {}) {
        this.baseUrl = config.baseUrl || "https://api.themoviedb.org";
        this.apiKey = config.apiKey || process.env.NEXT_PUBLIC_TMDB_API_KEY;
        this.apiVersion = config.apiVersion || "3";
    }

    public setApiKey(key: string): void {
        this.apiKey = key;
    }

    private getApiKey(): string {
        if (this.apiKey) return this.apiKey;

        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("debridui-settings");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const key = parsed?.state?.tmdbApiKey;
                    if (key) return key;
                }
            } catch {}
        }

        return process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
    }

    private async makeRequest<T>(
        endpoint: string,
        params: Record<string, string | number | boolean | undefined> = {},
        options: RequestInit = {}
    ): Promise<T> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new TMDBError(
                "TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY in your environment or enter it in Settings.",
                401,
                endpoint
            );
        }

        const queryParams = new URLSearchParams();
        queryParams.set("api_key", apiKey);

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                queryParams.set(key, String(value));
            }
        }

        const separator = endpoint.includes("?") ? "&" : "?";
        const url = `${this.baseUrl}/${this.apiVersion}${endpoint}${separator}${queryParams.toString()}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    accept: "application/json",
                    ...options.headers,
                },
            });

            if (!response.ok) {
                // biome-ignore lint/suspicious/noExplicitAny: error extraction
                const errorData: any = await response.json().catch(() => ({}));
                throw new TMDBError(
                    errorData.status_message || `API request failed: ${response.status} ${response.statusText}`,
                    response.status,
                    endpoint
                );
            }

            return (await response.json()) as T;
        } catch (error) {
            if (error instanceof TMDBError) {
                throw error;
            }
            throw new TMDBError(
                `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                undefined,
                endpoint
            );
        }
    }

    // Resolve an external ID or slug to numeric TMDB ID and media type
    public async resolveId(
        id: string | number,
        mediaType?: "movie" | "show"
    ): Promise<{ tmdbId: number; type: "movie" | "show" } | null> {
        let idStr = String(id).trim();
        try {
            idStr = decodeURIComponent(idStr);
        } catch {
            // ignore
        }

        // Check if prefixed with tmdb: (e.g. tmdb:1108427 or tmdb-1108427)
        if (idStr.toLowerCase().startsWith("tmdb:") || idStr.toLowerCase().startsWith("tmdb-")) {
            const parsed = Number.parseInt(idStr.slice(5).trim(), 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return { tmdbId: parsed, type: mediaType || "movie" };
            }
        }

        // If it starts with tt..., lookup via /find
        if (idStr.startsWith("tt")) {
            // biome-ignore lint/suspicious/noExplicitAny: find response
            const res = await this.makeRequest<any>(`/find/${idStr}`, { external_source: "imdb_id" });
            if (res.movie_results?.length > 0) {
                return { tmdbId: res.movie_results[0].id, type: "movie" };
            }
            if (res.tv_results?.length > 0) {
                return { tmdbId: res.tv_results[0].id, type: "show" };
            }
            return null;
        }

        // Check if numeric or has leading digits like "550-fight-club"
        const match = idStr.match(/^(\d+)/);
        if (match) {
            const numericId = Number.parseInt(match[1], 10);
            return { tmdbId: numericId, type: mediaType || "movie" };
        }

        // If it's a textual slug, search for it
        // biome-ignore lint/suspicious/noExplicitAny: search response
        const searchRes = await this.makeRequest<any>("/search/multi", { query: idStr });
        const first = searchRes.results?.find((r: any) => r.media_type === "movie" || r.media_type === "tv");
        if (first) {
            return { tmdbId: first.id, type: first.media_type === "movie" ? "movie" : "show" };
        }

        return null;
    }

    private async toNumericId(id: string | number, type: "movie" | "show"): Promise<number> {
        let idStr = String(id).trim();
        try {
            idStr = decodeURIComponent(idStr);
        } catch {
            // ignore
        }

        if (idStr.toLowerCase().startsWith("tmdb:") || idStr.toLowerCase().startsWith("tmdb-")) {
            const parsed = Number.parseInt(idStr.slice(5).trim(), 10);
            if (!Number.isNaN(parsed) && parsed > 0) return parsed;
        }

        if (idStr.startsWith("tt") || !idStr.match(/^\d+$/)) {
            const resolved = await this.resolveId(idStr, type);
            if (!resolved) {
                throw new TMDBError(
                    `${type === "movie" ? "Movie" : "Show"} not found: ${id}`,
                    404,
                    `/${type === "movie" ? "movie" : "tv"}/${id}`
                );
            }
            return resolved.tmdbId;
        }

        return Number.parseInt(idStr, 10);
    }

    // Search
    public async search(query: string, types: ("movie" | "show")[] = ["movie", "show"]): Promise<TraktSearchResult[]> {
        if (!query.trim()) return [];

        // biome-ignore lint/suspicious/noExplicitAny: search response
        const res = await this.makeRequest<any>("/search/multi", { query: query.trim(), include_adult: false });
        if (!res.results || !Array.isArray(res.results)) return [];

        const results: TraktSearchResult[] = [];
        for (const item of res.results) {
            if (item.media_type === "movie" && types.includes("movie")) {
                results.push({
                    type: "movie",
                    score: item.popularity || 0,
                    movie: mapRawMovieToMedia(item),
                });
            } else if (item.media_type === "tv" && types.includes("show")) {
                results.push({
                    type: "show",
                    score: item.popularity || 0,
                    show: mapRawShowToMedia(item),
                });
            }
        }
        return results;
    }

    // ID Lookup (for links, search, etc.)
    public async idLookup(idType: TraktIdType, id: string, type?: "movie" | "show"): Promise<TraktSearchResult[]> {
        const resolved = await this.resolveId(id, type);
        if (!resolved) return [];

        if (resolved.type === "movie") {
            const movie = await this.getMovie(resolved.tmdbId);
            return [{ type: "movie", score: 100, movie }];
        }
        const show = await this.getShow(resolved.tmdbId);
        return [{ type: "show", score: 100, show }];
    }

    // Discovery / Trending
    public async getTrendingMovies(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/trending/movie/week");
        return (res.results || []).slice(0, limit).map((m: any) => ({
            movie: mapRawMovieToMedia(m),
        }));
    }

    public async getTrendingShows(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/trending/tv/week");
        return (res.results || []).slice(0, limit).map((s: any) => ({
            show: mapRawShowToMedia(s),
        }));
    }

    public async getTrendingMixed(limit = 20): Promise<{ mixed: TraktMediaItem[] }> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/trending/all/week");
        const mixed = (res.results || [])
            .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
            .slice(0, limit)
            .map((item: any) => ({
                movie: item.media_type === "movie" ? mapRawMovieToMedia(item) : undefined,
                show: item.media_type === "tv" ? mapRawShowToMedia(item) : undefined,
            }));
        return { mixed };
    }

    public async getPopularMovies(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/movie/popular");
        return (res.results || []).slice(0, limit).map((m: any) => ({
            movie: mapRawMovieToMedia(m),
        }));
    }

    public async getPopularShows(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/tv/popular");
        return (res.results || []).slice(0, limit).map((s: any) => ({
            show: mapRawShowToMedia(s),
        }));
    }

    public async getMostWatchedMovies(_period = "weekly", limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/movie/top_rated");
        return (res.results || []).slice(0, limit).map((m: any) => ({
            movie: mapRawMovieToMedia(m),
        }));
    }

    public async getMostWatchedShows(_period = "weekly", limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/tv/top_rated");
        return (res.results || []).slice(0, limit).map((s: any) => ({
            show: mapRawShowToMedia(s),
        }));
    }

    public async getAnticipatedMovies(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/movie/upcoming");
        return (res.results || []).slice(0, limit).map((m: any) => ({
            movie: mapRawMovieToMedia(m),
        }));
    }

    public async getAnticipatedShows(limit = 20): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/tv/on_the_air");
        return (res.results || []).slice(0, limit).map((s: any) => ({
            show: mapRawShowToMedia(s),
        }));
    }

    public async getBoxOfficeMovies(): Promise<TraktMediaItem[]> {
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>("/movie/now_playing");
        return (res.results || []).slice(0, 20).map((m: any) => ({
            movie: mapRawMovieToMedia(m),
        }));
    }

    // Movie Details
    public async getMovie(id: string | number): Promise<TraktMedia> {
        const numericId = await this.toNumericId(id, "movie");

        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/movie/${numericId}`, {
            append_to_response: "external_ids,credits,release_dates,videos",
        });
        return mapRawMovieToMedia(res);
    }

    // Show Details
    public async getShow(id: string | number): Promise<TraktMedia> {
        const numericId = await this.toNumericId(id, "show");

        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/tv/${numericId}`, {
            append_to_response: "external_ids,credits,content_ratings,videos",
        });
        return mapRawShowToMedia(res);
    }

    // Seasons
    public async getShowSeasons(id: string | number): Promise<TraktSeason[]> {
        let numericId: number;
        try {
            numericId = await this.toNumericId(id, "show");
        } catch {
            return [];
        }

        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/tv/${numericId}`, { append_to_response: "external_ids" });
        const seasons = res.seasons || [];

        return seasons.map((s: any) => ({
            number: s.season_number,
            title: s.name,
            overview: s.overview,
            episode_count: s.episode_count,
            aired_episodes: s.episode_count,
            first_aired: s.air_date,
            ids: {
                trakt: s.id,
                slug: String(s.id),
                tmdb: s.id,
                imdb: res.external_ids?.imdb_id,
            },
            images: {
                poster: s.poster_path ? [tmdbImageUrl(s.poster_path, "w500")!] : [],
            },
        }));
    }

    // Episodes
    public async getShowEpisodes(id: string | number, season: number): Promise<TraktEpisode[]> {
        let numericId: number;
        try {
            numericId = await this.toNumericId(id, "show");
        } catch {
            return [];
        }

        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/tv/${numericId}/season/${season}`);
        const episodes = res.episodes || [];

        return episodes.map((ep: any) => ({
            season,
            number: ep.episode_number,
            title: ep.name,
            overview: ep.overview,
            first_aired: ep.air_date,
            runtime: ep.runtime,
            rating: typeof ep.vote_average === "number" ? Math.round(ep.vote_average * 10) / 10 : undefined,
            votes: ep.vote_count,
            ids: {
                trakt: ep.id,
                slug: String(ep.id),
                tmdb: ep.id,
            },
            images: {
                screenshot: ep.still_path ? [tmdbImageUrl(ep.still_path, "w500")!] : [],
            },
        }));
    }

    // People / Credits
    public async getPeople(id: string | number, type: "movies" | "shows" = "movies"): Promise<TraktCastAndCrew> {
        let numericId: number;
        try {
            numericId = await this.toNumericId(id, type === "movies" ? "movie" : "show");
        } catch {
            return { cast: [], crew: {} };
        }

        const endpoint = type === "movies" ? `/movie/${numericId}/credits` : `/tv/${numericId}/credits`;
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(endpoint);

        const cast: TraktCastMember[] = (res.cast || []).map((c: any) => ({
            characters: c.character ? [c.character] : [],
            episode_count: c.total_episode_count,
            person: {
                name: c.name,
                ids: {
                    trakt: c.id,
                    slug: String(c.id),
                    tmdb: c.id,
                },
                images: {
                    headshot: c.profile_path ? [tmdbImageUrl(c.profile_path, "w500")!] : [],
                },
            },
        }));

        const crew: TraktCrew = {
            directing: [],
            writing: [],
            production: [],
        };

        for (const member of res.crew || []) {
            const formattedMember: TraktCrewMember = {
                jobs: member.job ? [member.job] : [],
                person: {
                    name: member.name,
                    ids: {
                        trakt: member.id,
                        slug: String(member.id),
                        tmdb: member.id,
                    },
                    images: {
                        headshot: member.profile_path ? [tmdbImageUrl(member.profile_path, "w500")!] : [],
                    },
                },
            };

            const dept = member.department?.toLowerCase();
            if (dept === "directing") {
                crew.directing?.push(formattedMember);
            } else if (dept === "writing") {
                crew.writing?.push(formattedMember);
            } else {
                crew.production?.push(formattedMember);
            }
        }

        return { cast, crew };
    }

    public async getPerson(id: string | number): Promise<TraktPersonFull> {
        let numericId: number;
        if (typeof id === "string" && !id.match(/^\d+$/)) {
            const match = id.match(/^(\d+)/);
            numericId = match ? Number.parseInt(match[1], 10) : Number.parseInt(id, 10);
        } else {
            numericId = Number.parseInt(String(id), 10);
        }

        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/person/${numericId}`, {
            append_to_response: "external_ids,images",
        });

        return {
            name: res.name,
            biography: res.biography,
            birthday: res.birthday,
            death: res.deathday,
            birthplace: res.place_of_birth,
            homepage: res.homepage,
            known_for_department: res.known_for_department,
            gender: res.gender === 1 ? "female" : res.gender === 2 ? "male" : "non_binary",
            ids: {
                trakt: res.id,
                slug: String(res.id),
                tmdb: res.id,
                imdb: res.external_ids?.imdb_id,
            },
            images: {
                headshot: res.profile_path ? [tmdbImageUrl(res.profile_path, "w500")!] : [],
            },
        };
    }

    public async getPersonMovies(id: string | number): Promise<TraktPersonMovieCredits> {
        const numericId = Number.parseInt(String(id), 10);
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/person/${numericId}/movie_credits`);

        const cast: TraktPersonMovieCredit[] = (res.cast || []).map((c: any) => ({
            characters: c.character ? [c.character] : [],
            movie: mapRawMovieToMedia(c),
        }));

        return { cast };
    }

    public async getPersonShows(id: string | number): Promise<TraktPersonShowCredits> {
        const numericId = Number.parseInt(String(id), 10);
        // biome-ignore lint/suspicious/noExplicitAny: response
        const res = await this.makeRequest<any>(`/person/${numericId}/tv_credits`);

        const cast: TraktPersonShowCredit[] = (res.cast || []).map((c: any) => ({
            characters: c.character ? [c.character] : [],
            episode_count: c.episode_count,
            show: mapRawShowToMedia(c),
        }));

        return { cast };
    }

    // Episode Groups (Anime & alternate orderings)
    public async getTVSeriesEpisodeGroups(seriesId: number): Promise<TMDBEpisodeGroupsResponse> {
        return this.makeRequest<TMDBEpisodeGroupsResponse>(`/tv/${seriesId}/episode_groups`);
    }

    public async getEpisodeGroupDetails(groupId: string): Promise<TMDBEpisodeGroupDetails> {
        return this.makeRequest<TMDBEpisodeGroupDetails>(`/tv/episode_group/${groupId}`);
    }
}

export const tmdbClient = new TMDBClient();

// Legacy helper for hooks that instantiate dynamically with API key
export function createTMDBClient(apiKey?: string): TMDBClient | null {
    if (!apiKey && !process.env.NEXT_PUBLIC_TMDB_API_KEY) return null;
    return new TMDBClient({ apiKey });
}
