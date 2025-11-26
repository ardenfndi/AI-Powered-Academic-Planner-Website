import { Router } from "express";
import { solveSchedule, CourseInput, SlotInput, PreferencesInput } from "./solver";

export const solveRouter = Router();

solveRouter.post("/", (req, res) => {
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

    const result = solveSchedule(courses, slots, preferences);
    res.json(result);
  } catch (err) {
    console.error("POST /api/solve error:", err);
    res.status(500).json({ error: "Failed to solve schedule" });
  }
});
