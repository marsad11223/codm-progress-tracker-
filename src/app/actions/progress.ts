"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/app-error";
import { LOCAL_USER_ID } from "@/lib/constants";
import {
  setCamoCategoryCompleted,
  setDiamondMatches,
  setDiamondTracking,
  setWeaponGold,
  toggleChallenge,
} from "@/lib/services/progress";
import type { CamoCategory } from "@/types";

export async function toggleChallengeAction(input: {
  challengeId: string;
  slug: string;
  completed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await toggleChallenge({
      userId: LOCAL_USER_ID,
      challengeId: input.challengeId,
      completed: input.completed,
    });
    revalidatePath("/", "layout");
    revalidatePath(`/arsenal/${input.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not save that challenge."),
    };
  }
}

export async function setCamoCategoryAction(input: {
  weaponId: string;
  slug: string;
  category: CamoCategory;
  completed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await setCamoCategoryCompleted({
      userId: LOCAL_USER_ID,
      weaponId: input.weaponId,
      category: input.category,
      completed: input.completed,
    });
    revalidatePath("/", "layout");
    revalidatePath(`/arsenal/${input.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not update that camo category."),
    };
  }
}

export async function setWeaponGoldAction(input: {
  weaponId: string;
  slug: string;
  gold: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await setWeaponGold({
      userId: LOCAL_USER_ID,
      weaponId: input.weaponId,
      gold: input.gold,
    });
    revalidatePath("/", "layout");
    revalidatePath(`/arsenal/${input.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not update Gold for that weapon."),
    };
  }
}

export async function setDiamondTrackingAction(input: {
  weaponId: string;
  slug: string;
  tracked: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await setDiamondTracking({
      userId: LOCAL_USER_ID,
      weaponId: input.weaponId,
      tracked: input.tracked,
    });
    revalidatePath("/", "layout");
    revalidatePath(`/arsenal/${input.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not update Diamond tracking."),
    };
  }
}

export async function setDiamondMatchesAction(input: {
  weaponId: string;
  slug: string;
  matches: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await setDiamondMatches({
      userId: LOCAL_USER_ID,
      weaponId: input.weaponId,
      matches: input.matches,
    });
    revalidatePath("/", "layout");
    revalidatePath(`/arsenal/${input.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not save those Diamond matches."),
    };
  }
}
