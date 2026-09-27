"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/app-error";
import { buildExport, importProgress, resetProgress } from "@/lib/services/transfer";
import type { ExportFile } from "@/types";

export async function exportProgressAction(): Promise<
  { ok: true; data: ExportFile } | { ok: false; error: string }
> {
  try {
    const data = await buildExport();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: actionError(error, "Could not export progress.") };
  }
}

export async function importProgressAction(
  value: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await importProgress(value);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "Could not import that file.") };
  }
}

export async function resetProgressAction(
  confirmation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await resetProgress(confirmation);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "Could not reset progress.") };
  }
}
