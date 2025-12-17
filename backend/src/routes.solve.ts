import { Router } from "express";
import {
  solveSchedule,
  CourseInput,
  SlotInput,
  PreferencesInput,
} from "./solver";
import { prisma } from "./prisma";

export const solveRouter = Router();

solveRouter.post("/", async (req, res) => {
  try {
    const { courses, slots, preferences } = req.body as {
      courses?: CourseInput[];
      slots?: SlotInput[];
      preferences?: PreferencesInput;
    };

    if (!Array.isArray(courses) || !Array.isArray(slots)) {
      return res.status(400).json({
        error: "Body must contain 'courses' and 'slots' arrays",
      });
    }

    const validCourses = courses.filter(
      (c) => c && typeof c.id === "string" && typeof c.name === "string",
    );
    const validSlots = slots.filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.courseId === "string" &&
        typeof s.dayOfWeek === "number" &&
        typeof s.startTime === "string" &&
        typeof s.endTime === "string",
    );

    if (!validCourses.length || !validSlots.length) {
      return res.status(400).json({
        error: "courses and slots must be non-empty and include required fields",
        sample: {
          course: { id: "c1", code: "CS101", name: "Intro" },
          slot: {
            id: "s1",
            courseId: "c1",
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "10:00",
            room: "A1",
          },
        },
      });
    }

    const result = solveSchedule(validCourses, validSlots, preferences);
    await prisma.solveRun.create({
      data: { payload: JSON.stringify(result) },
    });
    res.json(result);
  } catch (err) {
    console.error("POST /api/solve error:", err);
    res.status(500).json({ error: "Failed to solve schedule", detail: `${err}` });
  }
});
