"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/app-error";
import { promoteWeaponToFirst, saveGrindOrder } from "@/lib/services/roadmap";

export async function saveGrindOrderAction(
  weaponIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await saveGrindOrder(weaponIds);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not save the roadmap order."),
    };
  }
}

export async function promoteWeaponAction(
  weaponId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await promoteWeaponToFirst(weaponId);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: actionError(error, "Could not move that weapon to first."),
    };
  }
}
