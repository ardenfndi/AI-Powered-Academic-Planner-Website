-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "explanation" TEXT,
    "payload" TEXT NOT NULL
);
INSERT INTO "new_SavedSchedule" ("createdAt", "explanation", "id", "payload", "userId") SELECT "createdAt", "explanation", "id", "payload", "userId" FROM "SavedSchedule";
DROP TABLE "SavedSchedule";
ALTER TABLE "new_SavedSchedule" RENAME TO "SavedSchedule";
CREATE TABLE "new_SavedScheduleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "courseCode" TEXT,
    "courseName" TEXT,
    "section" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    CONSTRAINT "SavedScheduleItem_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "SavedSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SavedScheduleItem" ("courseCode", "courseName", "dayOfWeek", "endTime", "id", "room", "scheduleId", "section", "startTime") SELECT "courseCode", "courseName", "dayOfWeek", "endTime", "id", "room", "scheduleId", "section", "startTime" FROM "SavedScheduleItem";
DROP TABLE "SavedScheduleItem";
ALTER TABLE "new_SavedScheduleItem" RENAME TO "SavedScheduleItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
