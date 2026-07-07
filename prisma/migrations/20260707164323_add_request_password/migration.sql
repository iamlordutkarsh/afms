/*
  Warnings:

  - Added the required column `passwordHash` to the `RegistrationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegistrationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "note" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedRole" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegistrationRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegistrationRequest" ("address", "assignedRole", "createdAt", "email", "id", "name", "note", "phone", "reviewedAt", "reviewedById", "status", "updatedAt") SELECT "address", "assignedRole", "createdAt", "email", "id", "name", "note", "phone", "reviewedAt", "reviewedById", "status", "updatedAt" FROM "RegistrationRequest";
DROP TABLE "RegistrationRequest";
ALTER TABLE "new_RegistrationRequest" RENAME TO "RegistrationRequest";
CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON "RegistrationRequest"("email");
CREATE INDEX "RegistrationRequest_status_idx" ON "RegistrationRequest"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
