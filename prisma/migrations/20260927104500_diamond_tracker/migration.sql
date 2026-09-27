ALTER TABLE "UserWeaponProgress" ADD COLUMN "diamondTracked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserWeaponProgress" ADD COLUMN "diamondMatches" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserWeaponProgress" ADD COLUMN "diamondUnlocked" BOOLEAN NOT NULL DEFAULT false;
