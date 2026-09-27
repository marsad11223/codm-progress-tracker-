-- CreateEnum
CREATE TYPE "WeaponCategory" AS ENUM ('SMG', 'AR', 'LMG', 'SNIPER', 'MARKSMAN', 'SHOTGUN', 'PISTOL', 'LAUNCHER', 'MELEE');

-- CreateEnum
CREATE TYPE "CamoCategory" AS ENUM ('SAND', 'DRAGON', 'SPLINTER', 'TIGER', 'JUNGLE', 'REPTILE', 'GOLD');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('KILLS', 'HEADSHOTS', 'HIPFIRE', 'LONGSHOT', 'FIVE_ATTACHMENTS', 'NO_ATTACHMENTS', 'CROUCHED', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "WeaponCategory" NOT NULL,
    "imageUrl" TEXT,
    "releaseSeason" TEXT,
    "difficultyScore" INTEGER,
    "difficultyReasons" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camo" (
    "id" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "category" "CamoCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Camo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "camoId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "challengeType" "ChallengeType" NOT NULL,
    "targetVerified" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWeaponProgress" (
    "userId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "goldUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWeaponProgress_pkey" PRIMARY KEY ("userId","weaponId")
);

-- CreateTable
CREATE TABLE "UserChallengeProgress" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChallengeProgress_pkey" PRIMARY KEY ("userId","challengeId")
);

-- CreateTable
CREATE TABLE "GrindOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrindOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Weapon_slug_key" ON "Weapon"("slug");

-- CreateIndex
CREATE INDEX "Weapon_category_active_idx" ON "Weapon"("category", "active");

-- CreateIndex
CREATE INDEX "Weapon_difficultyScore_idx" ON "Weapon"("difficultyScore");

-- CreateIndex
CREATE INDEX "Weapon_updatedAt_idx" ON "Weapon"("updatedAt");

-- CreateIndex
CREATE INDEX "Camo_weaponId_sortOrder_idx" ON "Camo"("weaponId", "sortOrder");

-- CreateIndex
CREATE INDEX "Camo_weaponId_category_idx" ON "Camo"("weaponId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Camo_weaponId_category_name_key" ON "Camo"("weaponId", "category", "name");

-- CreateIndex
CREATE INDEX "Challenge_weaponId_idx" ON "Challenge"("weaponId");

-- CreateIndex
CREATE INDEX "Challenge_camoId_sortOrder_idx" ON "Challenge"("camoId", "sortOrder");

-- CreateIndex
CREATE INDEX "UserWeaponProgress_userId_goldUnlocked_idx" ON "UserWeaponProgress"("userId", "goldUnlocked");

-- CreateIndex
CREATE INDEX "UserWeaponProgress_userId_updatedAt_idx" ON "UserWeaponProgress"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "UserWeaponProgress_userId_progressPercentage_idx" ON "UserWeaponProgress"("userId", "progressPercentage");

-- CreateIndex
CREATE INDEX "UserChallengeProgress_userId_completed_idx" ON "UserChallengeProgress"("userId", "completed");

-- CreateIndex
CREATE INDEX "UserChallengeProgress_userId_updatedAt_idx" ON "UserChallengeProgress"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "GrindOrder_userId_position_idx" ON "GrindOrder"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "GrindOrder_userId_weaponId_key" ON "GrindOrder"("userId", "weaponId");

-- CreateIndex
CREATE UNIQUE INDEX "GrindOrder_userId_position_key" ON "GrindOrder"("userId", "position");

-- AddForeignKey
ALTER TABLE "Camo" ADD CONSTRAINT "Camo_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_camoId_fkey" FOREIGN KEY ("camoId") REFERENCES "Camo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeaponProgress" ADD CONSTRAINT "UserWeaponProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeaponProgress" ADD CONSTRAINT "UserWeaponProgress_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeProgress" ADD CONSTRAINT "UserChallengeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeProgress" ADD CONSTRAINT "UserChallengeProgress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrindOrder" ADD CONSTRAINT "GrindOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrindOrder" ADD CONSTRAINT "GrindOrder_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
