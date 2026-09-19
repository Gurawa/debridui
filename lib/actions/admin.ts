"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { validateAdminPassword } from "@/lib/db/admin";

const ADDONS_COOKIE_NAME = "addons_admin_auth";

function getCookieSignature(): string {
    const secret = process.env.BETTER_AUTH_SECRET || "flix-gurawa-addons-cookie-salt-2026";
    return crypto.createHmac("sha256", secret).update("addons-admin-unlocked-session").digest("hex");
}

/**
 * Checks whether addons access has been unlocked for the current session.
 * STRICT: Only returns true if the verified unlock cookie is present.
 * Never automatically bypasses for any user so that clicking Addons always
 * prompts for the admin password until unlocked.
 */
export async function checkAddonsAdminUnlocked(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const cookieValue = cookieStore.get(ADDONS_COOKIE_NAME)?.value;
        if (cookieValue && cookieValue === getCookieSignature()) {
            return true;
        }
    } catch {
        // Continue to locked
    }

    return false;
}

/**
 * Verifies the admin password and sets an HTTP-only unlock cookie for the session.
 */
export async function verifyAddonsAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
    if (!password?.trim()) {
        return { success: false, error: "Please enter the admin password" };
    }

    const isValid = await validateAdminPassword(password.trim());
    if (!isValid) {
        return { success: false, error: "Incorrect admin password" };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADDONS_COOKIE_NAME, getCookieSignature(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 2, // 2 hours
        path: "/",
    });

    return { success: true };
}

/**
 * Locks addons access by clearing the unlock cookie.
 */
export async function lockAddonsAdmin(): Promise<{ success: boolean }> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(ADDONS_COOKIE_NAME);
    } catch {
        // Ignore
    }
    return { success: true };
}
