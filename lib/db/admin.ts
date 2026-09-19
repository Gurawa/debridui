import { verifyPassword } from "better-auth/crypto";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";

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
    } catch (error) {
        console.error("Error fetching first user from database:", error);
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

/**
 * Validates a candidate admin password.
 * Checks:
 * 1. ADMIN_PASSWORD environment variable if configured.
 * 2. The database password of the admin user (first user created in Neon DB, e.g. Gurawa).
 */
export async function validateAdminPassword(candidatePassword: string): Promise<boolean> {
    if (!candidatePassword?.trim()) {
        return false;
    }

    const trimmed = candidatePassword.trim();

    // 1. Check ADMIN_PASSWORD environment variable if configured
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    if (envAdminPassword && trimmed === envAdminPassword) {
        return true;
    }

    // 2. Check the admin user's database password in Neon DB
    try {
        const firstUser = await getFirstUser();
        if (firstUser) {
            const [adminAccount] = await db
                .select({
                    password: account.password,
                })
                .from(account)
                .where(and(eq(account.userId, firstUser.id), isNotNull(account.password)))
                .limit(1);

            if (adminAccount?.password) {
                const matches = await verifyPassword({
                    hash: adminAccount.password,
                    password: trimmed,
                });
                if (matches) {
                    return true;
                }
            }
        }
    } catch (error) {
        console.error("Error validating admin password against database:", error);
    }

    return false;
}
