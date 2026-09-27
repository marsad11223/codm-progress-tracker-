import { deleteGrindOrder, listGrind, replaceGrindOrder } from "@/lib/data/grind-order";
import { deleteUserProgress } from "@/lib/data/progress";
import { progressProvider } from "@/lib/data/database-provider";
import { prisma, runTransaction, type Db } from "@/lib/db/prisma";
import { AppError } from "@/lib/app-error";
import { LOCAL_USER_ID } from "@/lib/constants";
import { recomputeWeaponProgress } from "@/lib/services/progress";
import {
  CAMO_CATEGORIES,
  type CamoCategory,
  type ExportFile,
} from "@/types";

function isCamoCategory(value: unknown): value is CamoCategory {
  return (
    typeof value === "string" &&
    (CAMO_CATEGORIES as readonly string[]).includes(value)
  );
}

export function parseExportFile(value: unknown): ExportFile {
  if (!value || typeof value !== "object") {
    throw new AppError("Import file is not a JSON object.");
  }
  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== 1) {
    throw new AppError("Import file must use schema version 1.");
  }
  if (record.userId !== LOCAL_USER_ID) {
    throw new AppError("Import file is not for the local tracker.");
  }
  if (typeof record.exportedAt !== "string") {
    throw new AppError("Import file is missing exportedAt.");
  }
  if (!Array.isArray(record.challengeProgress) || !Array.isArray(record.grindOrder)) {
    throw new AppError("Import file is missing progress or roadmap data.");
  }
  if (
    record.theme != null &&
    record.theme !== "dark" &&
    record.theme !== "light"
  ) {
    throw new AppError("Theme must be dark or light.");
  }
  const seen = new Set<string>();
  const challengeProgress = record.challengeProgress.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new AppError(`Challenge row ${index + 1} is not an object.`);
    }
    const row = entry as Record<string, unknown>;
    if (typeof row.weaponSlug !== "string" || row.weaponSlug.length === 0) {
      throw new AppError(`Challenge row ${index + 1} is missing a weapon slug.`);
    }
    if (!isCamoCategory(row.camoCategory)) {
      throw new AppError(`Challenge row ${index + 1} has an unknown camo category.`);
    }
    if (typeof row.camoName !== "string" || row.camoName.length === 0) {
      throw new AppError(`Challenge row ${index + 1} is missing a camo name.`);
    }
    if (typeof row.challengeSortOrder !== "number" || !Number.isInteger(row.challengeSortOrder)) {
      throw new AppError(`Challenge row ${index + 1} has an invalid sort order.`);
    }
    if (typeof row.completed !== "boolean") {
      throw new AppError(`Challenge row ${index + 1} is missing completed.`);
    }
    if (typeof row.currentValue !== "number" || !Number.isFinite(row.currentValue)) {
      throw new AppError(`Challenge row ${index + 1} has an invalid current value.`);
    }
    const key = `${row.weaponSlug}|${row.camoCategory}|${row.camoName}|${row.challengeSortOrder}`;
    if (seen.has(key)) {
      throw new AppError(`Challenge row ${index + 1} is duplicated.`);
    }
    seen.add(key);
    return {
      weaponSlug: row.weaponSlug,
      camoCategory: row.camoCategory,
      camoName: row.camoName,
      challengeSortOrder: row.challengeSortOrder,
      completed: row.completed,
      currentValue: row.currentValue,
      targetValue: typeof row.targetValue === "number" ? row.targetValue : 0,
    };
  });
  const slugs = new Set<string>();
  const grindOrder = record.grindOrder.map((slug, index) => {
    if (typeof slug !== "string" || slug.length === 0) {
      throw new AppError(`Roadmap entry ${index + 1} is not a weapon slug.`);
    }
    if (slugs.has(slug)) {
      throw new AppError(`Roadmap lists ${slug} more than once.`);
    }
    slugs.add(slug);
    return slug;
  });
  return {
    schemaVersion: 1,
    exportedAt: record.exportedAt,
    userId: LOCAL_USER_ID,
    ...(record.theme === "dark" || record.theme === "light"
      ? { theme: record.theme }
      : {}),
    challengeProgress,
    grindOrder,
  };
}

export async function buildExport(): Promise<ExportFile> {
  const [progress, grind] = await Promise.all([
    progressProvider.listChallengeProgress(LOCAL_USER_ID),
    listGrind(prisma, LOCAL_USER_ID),
  ]);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    userId: LOCAL_USER_ID,
    challengeProgress: progress
      .map((row) => ({
        weaponSlug: row.weaponSlug,
        camoCategory: row.camoCategory,
        camoName: row.camoName,
        challengeSortOrder: row.challengeSortOrder,
        completed: row.completed,
        currentValue: row.currentValue,
        targetValue: row.targetValue,
      }))
      .sort((a, b) =>
        `${a.weaponSlug}|${a.camoCategory}|${a.camoName}|${a.challengeSortOrder}`.localeCompare(
          `${b.weaponSlug}|${b.camoCategory}|${b.camoName}|${b.challengeSortOrder}`,
        ),
      ),
    grindOrder: grind.map((entry) => entry.weapon.slug),
  };
}

async function resolveChallenges(db: Db) {
  return db.challenge.findMany({
    include: { weapon: true, camo: true },
  });
}

export async function importProgress(value: unknown): Promise<void> {
  const file = parseExportFile(value);
  await runTransaction(
    async (db) => {
      const existing = await db.userChallengeProgress.findMany({
        where: { userId: LOCAL_USER_ID },
        select: { challenge: { select: { weaponId: true } } },
      });
      const touched = new Set(existing.map((row) => row.challenge.weaponId));
      const catalogue = await resolveChallenges(db);
      const byKey = new Map(
        catalogue.map((challenge) => [
          `${challenge.weapon.slug}|${challenge.camo.category}|${challenge.camo.name}|${challenge.sortOrder}`,
          challenge,
        ]),
      );
      const writes: {
        userId: string;
        challengeId: string;
        completed: boolean;
        currentValue: number;
        targetValue: number;
      }[] = [];
      for (const row of file.challengeProgress) {
        const key = `${row.weaponSlug}|${row.camoCategory}|${row.camoName}|${row.challengeSortOrder}`;
        const challenge = byKey.get(key);
        if (!challenge) {
          throw new AppError(
            `No challenge matches ${row.weaponSlug} / ${row.camoCategory} / ${row.camoName} / ${row.challengeSortOrder}.`,
          );
        }
        touched.add(challenge.weaponId);
        writes.push({
          userId: LOCAL_USER_ID,
          challengeId: challenge.id,
          completed: row.completed,
          currentValue: row.currentValue,
          targetValue: challenge.target,
        });
      }
      const weapons = await db.weapon.findMany({
        where: { slug: { in: file.grindOrder }, active: true },
        select: { id: true, slug: true },
      });
      const weaponBySlug = new Map(weapons.map((weapon) => [weapon.slug, weapon.id]));
      const orderedIds: string[] = [];
      for (const slug of file.grindOrder) {
        const weaponId = weaponBySlug.get(slug);
        if (!weaponId) {
          throw new AppError(`Roadmap slug ${slug} is not an active weapon.`);
        }
        orderedIds.push(weaponId);
      }

      await deleteUserProgress(db, LOCAL_USER_ID);
      if (writes.length > 0) {
        await db.userChallengeProgress.createMany({ data: writes });
      }
      await replaceGrindOrder(db, LOCAL_USER_ID, orderedIds);
      for (const weaponId of touched) {
        await recomputeWeaponProgress(db, LOCAL_USER_ID, weaponId);
      }
    },
    { timeout: 60_000 },
  );
}

export async function resetProgress(confirmation: string): Promise<void> {
  if (confirmation !== "RESET") {
    throw new AppError("Type RESET to confirm.");
  }
  await runTransaction(async (db) => {
    await deleteUserProgress(db, LOCAL_USER_ID);
    await deleteGrindOrder(db, LOCAL_USER_ID);
  });
}
