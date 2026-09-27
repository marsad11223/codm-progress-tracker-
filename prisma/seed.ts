import { CamoCategory, Prisma } from "@prisma/client";
import { GOLD_REQUIREMENT, GOLD_SEED_SLUGS, LOCAL_USER_ID, UNVERIFIED_REQUIREMENT } from "../src/lib/constants";
import { prisma } from "../src/lib/db/prisma";
import { recomputeWeaponProgress } from "../src/lib/services/progress";
import { CAMO_GROUPS, SMG_WEAPONS } from "./seed-data/smgs";

function basePatternCount(): number {
  return CAMO_GROUPS.reduce((sum, group) => sum + group.patterns.length, 0);
}

async function hasUserEdits(): Promise<boolean> {
  const goldSlugs = [...GOLD_SEED_SLUGS];
  const challengeEdit = await prisma.userChallengeProgress.findFirst({
    where: {
      OR: [
        { challenge: { weapon: { slug: { notIn: goldSlugs } } } },
        {
          completed: false,
          challenge: { weapon: { slug: { in: goldSlugs } } },
        },
      ],
    },
  });
  if (challengeEdit) return true;
  const weaponEdit = await prisma.userWeaponProgress.findFirst({
    where: {
      OR: [
        { weapon: { slug: { notIn: goldSlugs } } },
        { goldUnlocked: false, weapon: { slug: { in: goldSlugs } } },
      ],
    },
  });
  return Boolean(weaponEdit);
}

async function writeCatalogue(weaponIds: string[]) {
  await prisma.camo.deleteMany({ where: { weaponId: { in: weaponIds } } });
  const patternCount = basePatternCount();
  const camoData: Prisma.CamoCreateManyInput[] = [];
  for (const weaponId of weaponIds) {
    for (const group of CAMO_GROUPS) {
      group.patterns.forEach((name) => {
        camoData.push({
          weaponId,
          category: group.category,
          name,
          requirement: UNVERIFIED_REQUIREMENT,
          target: 0,
          imageUrl: null,
          sortOrder: group.sortOrder,
        });
      });
    }
    camoData.push({
      weaponId,
      category: CamoCategory.GOLD,
      name: "Gold",
      requirement: GOLD_REQUIREMENT,
      target: patternCount,
      imageUrl: null,
      sortOrder: 7,
    });
  }
  const camos = await prisma.camo.createManyAndReturn({ data: camoData });
  const camoId = new Map(
    camos.map((camo) => [`${camo.weaponId}|${camo.category}|${camo.name}`, camo.id]),
  );
  const challengeData: Prisma.ChallengeCreateManyInput[] = [];
  for (const weaponId of weaponIds) {
    for (const group of CAMO_GROUPS) {
      group.patterns.forEach((name, index) => {
        const id = camoId.get(`${weaponId}|${group.category}|${name}`);
        if (!id) {
          throw new Error(`Missing camo ${name} for ${weaponId}.`);
        }
        challengeData.push({
          weaponId,
          camoId: id,
          description: UNVERIFIED_REQUIREMENT,
          target: 0,
          challengeType: "OTHER",
          targetVerified: false,
          sortOrder: index + 1,
        });
      });
    }
  }
  await prisma.challenge.createMany({ data: challengeData });
  return { camos: camoData.length, challenges: challengeData.length };
}

async function applyGoldSeed(weaponIdBySlug: Map<string, string>) {
  for (const slug of GOLD_SEED_SLUGS) {
    const weaponId = weaponIdBySlug.get(slug);
    if (!weaponId) {
      throw new Error(`Gold seed weapon ${slug} was not created.`);
    }
    const challenges = await prisma.challenge.findMany({
      where: { weaponId },
      select: { id: true },
    });
    await prisma.$transaction(
      async (tx) => {
        await tx.userChallengeProgress.createMany({
          data: challenges.map((challenge) => ({
            userId: LOCAL_USER_ID,
            challengeId: challenge.id,
            completed: true,
            currentValue: 0,
            targetValue: 0,
          })),
        });
        const weapon = await recomputeWeaponProgress(tx, LOCAL_USER_ID, weaponId);
        if (!weapon.goldUnlocked || weapon.progressPercentage !== 100) {
          throw new Error(`Recompute did not mark ${slug} as Gold.`);
        }
      },
      { timeout: 30_000 },
    );
  }
}

async function main() {
  const resetProgress = process.argv.includes("--reset-progress");
  const patternCount = basePatternCount();
  if (SMG_WEAPONS.length !== 32) {
    throw new Error(`Expected 32 SMGs, found ${SMG_WEAPONS.length}.`);
  }
  if (patternCount !== 60) {
    throw new Error(`Expected 60 base patterns, found ${patternCount}.`);
  }
  for (const group of CAMO_GROUPS) {
    if (group.patterns.length !== 10) {
      throw new Error(`${group.category} does not have 10 patterns.`);
    }
  }

  await prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    create: { id: LOCAL_USER_ID, displayName: "Local" },
    update: { displayName: "Local" },
  });

  if (resetProgress) {
    await prisma.userChallengeProgress.deleteMany({ where: { userId: LOCAL_USER_ID } });
    await prisma.userWeaponProgress.deleteMany({ where: { userId: LOCAL_USER_ID } });
    await prisma.grindOrder.deleteMany({ where: { userId: LOCAL_USER_ID } });
  }

  const userEdits = resetProgress ? false : await hasUserEdits();
  const weaponIdBySlug = new Map<string, string>();

  for (const weapon of SMG_WEAPONS) {
    const row = await prisma.weapon.upsert({
      where: { slug: weapon.slug },
      create: {
        name: weapon.name,
        slug: weapon.slug,
        category: "SMG",
        releaseSeason: weapon.releaseSeason,
        imageUrl: null,
        difficultyScore: null,
        difficultyReasons: [],
        active: true,
      },
      update: {
        name: weapon.name,
        category: "SMG",
        releaseSeason: weapon.releaseSeason,
        active: true,
      },
    });
    weaponIdBySlug.set(weapon.slug, row.id);
  }

  const weaponIds = [...weaponIdBySlug.values()];
  if (!userEdits) {
    const counts = await writeCatalogue(weaponIds);
    await applyGoldSeed(weaponIdBySlug);
    const gold = await prisma.userWeaponProgress.findMany({
      where: {
        userId: LOCAL_USER_ID,
        weapon: { slug: { in: [...GOLD_SEED_SLUGS] } },
        goldUnlocked: true,
        progressPercentage: 100,
      },
    });
    if (gold.length !== GOLD_SEED_SLUGS.length) {
      throw new Error("Gold seed did not unlock every named weapon.");
    }
    console.log(
      `Seeded ${SMG_WEAPONS.length} SMGs, ${counts.camos} camos, ${counts.challenges} challenges.`,
    );
    console.log(`Gold via recompute: ${GOLD_SEED_SLUGS.join(", ")}.`);
    return;
  }

  let added = 0;
  for (const weaponId of weaponIds) {
    const existing = await prisma.camo.count({ where: { weaponId } });
    if (existing === 0) {
      await writeCatalogue([weaponId]);
      added += 1;
    }
  }
  console.log(
    added > 0
      ? `Progress edits found. Added catalogue rows for ${added} new weapons and left existing progress in place.`
      : "Progress edits found. Left camo rows and progress in place.",
  );
  console.log("Pass --reset-progress to wipe progress and reapply the Gold seed.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
