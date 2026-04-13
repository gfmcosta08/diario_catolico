ALTER TABLE "Profile"
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ADD COLUMN IF NOT EXISTS "usernameChangedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Profile_username_key'
  ) THEN
    CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProfileParish" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProfileParish_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ProfileParish_profileId_fkey'
  ) THEN
    ALTER TABLE "ProfileParish"
      ADD CONSTRAINT "ProfileParish_profileId_fkey"
      FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'ProfileParish_profileId_name_city_state_key'
  ) THEN
    CREATE UNIQUE INDEX "ProfileParish_profileId_name_city_state_key"
      ON "ProfileParish"("profileId", "name", "city", "state");
  END IF;
END $$;
