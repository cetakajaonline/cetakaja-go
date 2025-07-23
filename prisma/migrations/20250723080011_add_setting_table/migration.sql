-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
