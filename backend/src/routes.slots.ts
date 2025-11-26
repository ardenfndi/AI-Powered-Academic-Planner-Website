import { Router } from "express";
import { prisma } from "./prisma";

export const slots = Router();

// Slot ekle
slots.post("/", async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room } = req.body;

    if (!courseId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        error: "courseId, dayOfWeek, startTime, endTime are required",
      });
    }

    const s = await prisma.courseSlot.create({
      data: {
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      },
    });

    res.status(201).json(s);
  } catch (err) {
    console.error("POST /api/slots error:", err);
    res.status(500).json({ error: "Failed to create slot" });
  }
});

// Slotları listele (isteğe bağlı courseId filtresiyle)
slots.get("/", async (req, res) => {
  try {
    const { courseId } = req.query as { courseId?: string };
    const where = courseId ? { courseId } : {};

    const data = await prisma.courseSlot.findMany({ where });
    res.json(data);
  } catch (err) {
    console.error("GET /api/slots error:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});
