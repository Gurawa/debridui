"use server";

import { and, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { checkAddonsAdminUnlocked } from "@/lib/actions/admin";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFirstUser } from "@/lib/db/admin";
import { addons } from "@/lib/db/schema";
import { addonOrderUpdateSchema, addonSchema } from "@/lib/schemas";
import type { CreateAddon } from "@/lib/types";

/**
 * Get addons from database.
 * If unlocked with admin password (management mode on /addons), returns the admin's addons.
 * For general media streaming, returns user's addons or falls back to admin's configured addons.
 */
export async function getUserAddons() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const firstUser = await getFirstUser();
    const isUnlocked = await checkAddonsAdminUnlocked();

    // In admin unlocked mode, manage the admin user's addons
    if (isUnlocked && firstUser) {
        return await db.select().from(addons).where(eq(addons.userId, firstUser.id)).orderBy(addons.order);
    }

    // Otherwise for media streaming: check user's own addons first
    let userAddons = await db.select().from(addons).where(eq(addons.userId, session.user.id)).orderBy(addons.order);

    // If user has no addons of their own, fallback to admin's configured addons for playback
    if (userAddons.length === 0 && firstUser) {
        userAddons = await db.select().from(addons).where(eq(addons.userId, firstUser.id)).orderBy(addons.order);
    }

    return userAddons;
}

/**
 * Add a new addon (requires admin unlock)
 */
export async function addAddon(data: CreateAddon) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const isUnlocked = await checkAddonsAdminUnlocked();
    if (!isUnlocked) {
        throw new Error("Admin password required to add addons");
    }

    const firstUser = await getFirstUser();
    const targetUserId = firstUser ? firstUser.id : session.user.id;

    const validated = addonSchema.parse(data);

    // Calculate next order atomically
    const [maxOrder] = await db
        .select({ max: sql<number>`COALESCE(MAX(${addons.order}), -1)` })
        .from(addons)
        .where(eq(addons.userId, targetUserId));

    const newOrder = (maxOrder?.max ?? -1) + 1;
    const newId = uuidv7();

    await db.insert(addons).values({
        id: newId,
        userId: targetUserId,
        name: validated.name,
        url: validated.url,
        enabled: validated.enabled,
        order: newOrder,
    });

    revalidatePath("/", "layout");

    return {
        id: newId,
        name: validated.name,
        url: validated.url,
        enabled: validated.enabled,
        order: newOrder,
    };
}

/**
 * Remove an addon (requires admin unlock)
 */
export async function removeAddon(addonId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const isUnlocked = await checkAddonsAdminUnlocked();
    if (!isUnlocked) {
        throw new Error("Admin password required to modify addons");
    }

    const firstUser = await getFirstUser();
    const targetUserId = firstUser ? firstUser.id : session.user.id;

    const validatedId = z.string().min(1, "Addon ID is required").parse(addonId);

    await db
        .delete(addons)
        .where(
            and(eq(addons.id, validatedId), or(eq(addons.userId, session.user.id), eq(addons.userId, targetUserId)))
        );

    revalidatePath("/", "layout");
    return { success: true };
}

/**
 * Toggle addon enabled status (requires admin unlock)
 */
export async function toggleAddon(addonId: string, enabled: boolean) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const isUnlocked = await checkAddonsAdminUnlocked();
    if (!isUnlocked) {
        throw new Error("Admin password required to modify addons");
    }

    const firstUser = await getFirstUser();
    const targetUserId = firstUser ? firstUser.id : session.user.id;

    const validatedId = z.string().min(1, "Addon ID is required").parse(addonId);
    const validatedEnabled = z.boolean({ error: "Enabled must be a boolean" }).parse(enabled);

    await db
        .update(addons)
        .set({ enabled: validatedEnabled })
        .where(
            and(eq(addons.id, validatedId), or(eq(addons.userId, session.user.id), eq(addons.userId, targetUserId)))
        );

    revalidatePath("/", "layout");
    return { success: true };
}

/**
 * Update addon orders for reordering (requires admin unlock)
 */
export async function updateAddonOrders(updates: { id: string; order: number }[]) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const isUnlocked = await checkAddonsAdminUnlocked();
    if (!isUnlocked) {
        throw new Error("Admin password required to reorder addons");
    }

    const firstUser = await getFirstUser();
    const targetUserId = firstUser ? firstUser.id : session.user.id;

    const validated = addonOrderUpdateSchema.parse(updates);

    await db.transaction(async (tx) => {
        // Defer constraint checking until transaction commit
        await tx.execute(sql`SET CONSTRAINTS unique_user_order DEFERRED`);

        // Directly update each addon to its new order
        for (const update of validated) {
            await tx
                .update(addons)
                .set({ order: update.order })
                .where(
                    and(
                        eq(addons.id, update.id),
                        or(eq(addons.userId, session.user.id), eq(addons.userId, targetUserId))
                    )
                );
        }
    });

    revalidatePath("/", "layout");
    return { success: true };
}
