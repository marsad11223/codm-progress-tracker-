"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/app-error";
import { saveGrindOrder } from "@/lib/services/roadmap";

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
