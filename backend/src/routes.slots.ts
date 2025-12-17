import { Router } from "express";
import { prisma } from "./prisma";

export const slots = Router();

// Create a slot
slots.post("/", async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room } = req.body as {
      courseId?: string;
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      room?: string | null;
    };
    const dayNum = Number(dayOfWeek);

    if (!courseId || Number.isNaN(dayNum) || !startTime || !endTime) {
      return res.status(400).json({
        error: "courseId, dayOfWeek, startTime, endTime are required",
      });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    const s = await prisma.courseSlot.upsert({
      where: {
        courseId_dayOfWeek_startTime_endTime_room: {
          courseId,
          dayOfWeek: dayNum,
          startTime,
          endTime,
          room: room ?? null,
        },
      },
      update: {},
      create: {
        courseId,
        dayOfWeek: dayNum,
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

// List slots, optionally filtered by courseId
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

slots.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.courseSlot.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/slots/:id error:", err);
    res.status(500).json({ error: "Failed to delete slot" });
  }
});
