import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Returns the first user created in the database (earliest createdAt timestamp).
 * Dynamically resolves at runtime without any hardcoding.
 */
export async function getFirstUser() {
    try {
        const [first] = await db
            .select({
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            })
            .from(user)
            .orderBy(asc(user.createdAt))
            .limit(1);
        return first || null;
    } catch {
        return null;
    }
}

/**
 * Determines whether a given user ID is an admin.
 * Checks runtime environment overrides and dynamically identifies the first user created in Neon DB.
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;

    // 1. Optional explicit override via environment variables (e.g. Vercel)
    if (process.env.ADMIN_USER_ID && process.env.ADMIN_USER_ID === userId) {
        return true;
    }

    // 2. Neon DB dynamic check: The first user created in the database is the admin
    const firstUser = await getFirstUser();
    if (firstUser && firstUser.id === userId) {
        return true;
    }

    return false;
}
