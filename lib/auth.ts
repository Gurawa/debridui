import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/lib/db";

import { validateAdminPassword } from "@/lib/db/admin";

const isGoogleOAuthEnabled = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const isEmailSignupDisabled = process.env.NEXT_PUBLIC_DISABLE_EMAIL_SIGNUP === "true";
const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
    baseURL: appURL,
    trustedOrigins: [appURL],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    emailAndPassword: {
        enabled: true,
        disableSignUp: isEmailSignupDisabled,
    },
    socialProviders: isGoogleOAuthEnabled
        ? {
              google: {
                  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
              },
          }
        : undefined,
    session: {
        expiresIn: 60 * 60 * 24 * 365, // 1 year in seconds
        updateAge: 60 * 60 * 24 * 7, // Update session every 7 days
        freshAge: 0, // default 1 day would 403 /list-sessions for any older session
        cookieCache: {
            enabled: true,
            maxAge: 1 * 60 * 60, // 1 hour cache
            strategy: "jwt",
        },
    },
    advanced: {
        database: {
            generateId: () => uuidv7(),
        },
        cookiePrefix: "debridui",
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email") {
                const body = (ctx.body || {}) as Record<string, unknown>;
                const providedPassword =
                    (body.adminPassword as string | undefined) || ctx.headers?.get("x-admin-password");

                if (!providedPassword || typeof providedPassword !== "string" || !providedPassword.trim()) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Admin password is required to create an account.",
                    });
                }

                const isValid = await validateAdminPassword(providedPassword.trim());
                if (!isValid) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Invalid admin password. Account registration requires the correct admin password.",
                    });
                }
            }
        }),
    },
    plugins: [nextCookies()],
});
