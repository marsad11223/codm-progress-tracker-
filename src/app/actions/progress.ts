"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/app-error";
import { LOCAL_USER_ID } from "@/lib/constants";
import { toggleChallenge } from "@/lib/services/progress";

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
