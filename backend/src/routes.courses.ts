import { Router } from "express";
import { prisma } from "./prisma";

export const courses = Router();

type CreateCourseBody = {
  name?: string;
  code?: string;
};

// List all courses
courses.get("/", async (_req, res) => {
  try {
    const data = await prisma.course.findMany({
      include: { slots: true },
    });
    res.json(data);
  } catch (err) {
    console.error("GET /api/courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Create a course
courses.post("/", async (req, res) => {
  try {
    const { name, code } = req.body as CreateCourseBody;

    if (!name || !code) {
      return res.status(400).json({ error: "name and code are required" });
    }

    const c = await prisma.course.upsert({
      where: { code },
      update: { name },
      create: { name, code },
      include: { slots: true },
    });

    res.status(201).json(c);
  } catch (err) {
    console.error("POST /api/courses error:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});
