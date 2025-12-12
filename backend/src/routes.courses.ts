import { Router } from "express";
import { prisma } from "./prisma";

export const courses = Router();

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
    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: "code and name are required" });
    }

    const c = await prisma.course.create({
      data: { code, name },
    });

    res.status(201).json(c);
  } catch (err) {
    console.error("POST /api/courses error:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});
