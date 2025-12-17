-- Create SavedSchedule and SavedScheduleItem tables
CREATE TABLE "SavedSchedule" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "userId" TEXT,
  "explanation" TEXT,
  "payload" TEXT NOT NULL
);

CREATE TABLE "SavedScheduleItem" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  "scheduleId" TEXT NOT NULL,
  "courseCode" TEXT,
  "courseName" TEXT,
  "section" TEXT,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "room" TEXT,
  FOREIGN KEY ("scheduleId") REFERENCES "SavedSchedule" ("id") ON DELETE CASCADE
);

CREATE INDEX "SavedScheduleItem_scheduleId_idx" ON "SavedScheduleItem" ("scheduleId");
