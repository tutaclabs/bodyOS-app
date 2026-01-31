-- AlterTable
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'UserState' AND column_name = 'notifications') THEN
        ALTER TABLE "UserState" ADD COLUMN "notifications" JSONB NOT NULL DEFAULT '[]';
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "InjectionSite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteLocation" TEXT NOT NULL,
    "lastUsedDate" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InjectionSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SideEffect" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "protocolId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "duration" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SideEffect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InjectionSite_userId_idx" ON "InjectionSite"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InjectionSite_userId_siteLocation_idx" ON "InjectionSite"("userId", "siteLocation");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SideEffect_userId_idx" ON "SideEffect"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SideEffect_userId_date_idx" ON "SideEffect"("userId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SideEffect_protocolId_idx" ON "SideEffect"("protocolId");

-- AddForeignKey
ALTER TABLE "InjectionSite" ADD CONSTRAINT "InjectionSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SideEffect" ADD CONSTRAINT "SideEffect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
