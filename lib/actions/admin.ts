"use server";

import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/db/admin";

const ADDONS_COOKIE_NAME = "addons_admin_auth";

function getCookieSignature(): string {
    const secret = process.env.BETTER_AUTH_SECRET || "flix-gurawa-addons-cookie-salt-2026";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    return crypto.createHmac("sha256", secret).update(adminPassword).digest("hex");
}

/**
 * Checks whether addons access has been unlocked for the current session.
 */
export async function checkAddonsAdminUnlocked(): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no admin password is configured, access is unrestricted
    if (!adminPassword) {
        return true;
    }

    // Check if current user is the admin user (first user created in Neon DB)
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (session && (await isUserAdmin(session.user.id))) {
            return true;
        }
    } catch {
        // Continue to cookie check
    }

    // Check for verified session cookie
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(ADDONS_COOKIE_NAME)?.value;
    if (cookieValue && cookieValue === getCookieSignature()) {
        return true;
    }

    return false;
}

/**
 * Verifies the admin password and sets an HTTP-only unlock cookie for the session.
 */
export async function verifyAddonsAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        return { success: true };
    }

    if (password !== adminPassword) {
        return { success: false, error: "Incorrect admin password" };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADDONS_COOKIE_NAME, getCookieSignature(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });

    return { success: true };
}
