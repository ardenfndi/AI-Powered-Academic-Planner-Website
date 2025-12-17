/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,dayOfWeek,startTime,endTime,room]` on the table `CourseSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSlot_courseId_dayOfWeek_startTime_endTime_room_key" ON "CourseSlot"("courseId", "dayOfWeek", "startTime", "endTime", "room");
