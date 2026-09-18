import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { type TraktIdType, tmdbClient } from "@/lib/tmdb";

// Cache duration constants
const CACHE_DURATION = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    STANDARD: 6 * 60 * 60 * 1000, // 6 hours
    LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Generic TMDB query hook factory
// biome-ignore lint/suspicious/noExplicitAny: rest tuple type erases call-site inference
function createMediaHook<T extends any[], R>(
    keyParts: string[],
    fn: (...args: T) => Promise<R>,
    cacheDuration: number
) {
    return (...args: T): UseQueryResult<R> => {
        return useQuery({
            queryKey: ["media", ...keyParts, ...args],
            queryFn: () => fn(...args),
            staleTime: cacheDuration,
        });
    };
}

// List hooks
export const useTrendingMovies = createMediaHook(
    ["movies", "trending"],
    (limit = 20) => tmdbClient.getTrendingMovies(limit),
    CACHE_DURATION.STANDARD
);

export const useTrendingShows = createMediaHook(
    ["shows", "trending"],
    (limit = 20) => tmdbClient.getTrendingShows(limit),
    CACHE_DURATION.STANDARD
);

export const usePopularMovies = createMediaHook(
    ["movies", "popular"],
    (limit = 20) => tmdbClient.getPopularMovies(limit),
    CACHE_DURATION.STANDARD
);

export const usePopularShows = createMediaHook(
    ["shows", "popular"],
    (limit = 20) => tmdbClient.getPopularShows(limit),
    CACHE_DURATION.STANDARD
);

export const useMostWatchedMovies = createMediaHook(
    ["movies", "watched"],
    (period = "weekly", limit = 20) => tmdbClient.getMostWatchedMovies(period, limit),
    CACHE_DURATION.STANDARD
);

export const useMostWatchedShows = createMediaHook(
    ["shows", "watched"],
    (period = "weekly", limit = 20) => tmdbClient.getMostWatchedShows(period, limit),
    CACHE_DURATION.STANDARD
);

export const useAnticipatedMovies = createMediaHook(
    ["movies", "anticipated"],
    (limit = 20) => tmdbClient.getAnticipatedMovies(limit),
    CACHE_DURATION.STANDARD
);

export const useAnticipatedShows = createMediaHook(
    ["shows", "anticipated"],
    (limit = 20) => tmdbClient.getAnticipatedShows(limit),
    CACHE_DURATION.STANDARD
);

export const useBoxOfficeMovies = createMediaHook(
    ["movies", "boxoffice"],
    () => tmdbClient.getBoxOfficeMovies(),
    CACHE_DURATION.STANDARD
);

// Details hooks
export const useMovieDetails = createMediaHook(
    ["movie"],
    (slug: string) => tmdbClient.getMovie(slug),
    CACHE_DURATION.LONG
);

export const useShowDetails = createMediaHook(
    ["show"],
    (slug: string) => tmdbClient.getShow(slug),
    CACHE_DURATION.LONG
);

export const useShowSeasons = createMediaHook(
    ["show", "seasons"],
    (slug: string) => tmdbClient.getShowSeasons(slug),
    CACHE_DURATION.LONG
);

export const useSeasonEpisodes = createMediaHook(
    ["season", "episodes"],
    (slug: string, season: number) => tmdbClient.getShowEpisodes(slug, season),
    CACHE_DURATION.LONG
);

export const useShowEpisodes = useSeasonEpisodes;

// Combined hooks
export function useTrendingMixed(limit = 20) {
    return useQuery({
        queryKey: ["media", "mixed", "trending", limit],
        queryFn: () => tmdbClient.getTrendingMixed(limit),
        staleTime: CACHE_DURATION.STANDARD,
    });
}

// Fetch media by id. When `type` is known (slug routes) it hits the type-specific
// endpoint directly; when omitted (external-id routes) a single id-lookup resolves
// both the type and the media.
export function useMedia({ id, type, idType = "imdb" }: { id: string; type?: "movie" | "show"; idType?: TraktIdType }) {
    const direct = useQuery({
        queryKey: ["media", "detail", id, type],
        queryFn: () => (type === "movie" ? tmdbClient.getMovie(id) : tmdbClient.getShow(id)),
        staleTime: CACHE_DURATION.LONG,
        enabled: !!id && !!type,
    });

    const lookup = useQuery({
        queryKey: ["media", "lookup", idType, id],
        queryFn: () => tmdbClient.idLookup(idType, id, type),
        staleTime: CACHE_DURATION.LONG,
        enabled: !!id && !type,
    });

    if (type) {
        return { media: direct.data, type, isLoading: direct.isLoading, error: direct.error };
    }

    const result = lookup.data?.[0];
    const resolvedType = result?.type as "movie" | "show" | undefined;
    const media = result?.movie ?? result?.show;
    const notFound = lookup.isSuccess && !media;
    return {
        media,
        type: resolvedType,
        isLoading: lookup.isLoading,
        error: lookup.error ?? (notFound ? new Error("Title not found") : null),
    };
}

export function usePeople(id: string, type: "movies" | "shows" = "movies") {
    return useQuery({
        queryKey: ["media", "people", id, type],
        queryFn: () => tmdbClient.getPeople(id, type),
        staleTime: CACHE_DURATION.LONG,
    });
}

export const usePerson = createMediaHook(["person"], (slug: string) => tmdbClient.getPerson(slug), CACHE_DURATION.LONG);

export const usePersonMovies = createMediaHook(
    ["person", "movies"],
    (slug: string) => tmdbClient.getPersonMovies(slug),
    CACHE_DURATION.LONG
);

export const usePersonShows = createMediaHook(
    ["person", "shows"],
    (slug: string) => tmdbClient.getPersonShows(slug),
    CACHE_DURATION.LONG
);

// Backward-compatible aliases for smooth transition
export const useTraktTrendingMovies = useTrendingMovies;
export const useTraktTrendingShows = useTrendingShows;
export const useTraktPopularMovies = usePopularMovies;
export const useTraktPopularShows = usePopularShows;
export const useTraktMostWatchedMovies = useMostWatchedMovies;
export const useTraktMostWatchedShows = useMostWatchedShows;
export const useTraktAnticipatedMovies = useAnticipatedMovies;
export const useTraktAnticipatedShows = useAnticipatedShows;
export const useTraktBoxOfficeMovies = useBoxOfficeMovies;
export const useTraktMovieDetails = useMovieDetails;
export const useTraktShowDetails = useShowDetails;
export const useTraktShowSeasons = useShowSeasons;
export const useTraktSeasonEpisodes = useSeasonEpisodes;
export const useTraktShowEpisodes = useShowEpisodes;
export const useTraktTrendingMixed = useTrendingMixed;
export const useTraktMedia = useMedia;
export const useTraktPeople = usePeople;
export const useTraktPerson = usePerson;
export const useTraktPersonMovies = usePersonMovies;
export const useTraktPersonShows = usePersonShows;
