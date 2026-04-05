-- CreateTable: PackageParticipant (replaces Package.userId with a join table)
CREATE TABLE "PackageParticipant" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PackageParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique constraint on (packageId, userId)
CREATE UNIQUE INDEX "PackageParticipant_packageId_userId_key" ON "PackageParticipant"("packageId", "userId");

-- AddForeignKey
ALTER TABLE "PackageParticipant" ADD CONSTRAINT "PackageParticipant_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageParticipant" ADD CONSTRAINT "PackageParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: backfill one PackageParticipant per existing Package row
INSERT INTO "PackageParticipant" ("id", "packageId", "userId")
SELECT gen_random_uuid()::text, "id", "userId"
FROM "Package";

-- DropColumn: remove the denormalised userId from Package
ALTER TABLE "Package" DROP COLUMN "userId";
