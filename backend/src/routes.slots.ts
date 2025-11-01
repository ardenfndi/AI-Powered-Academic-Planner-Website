import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

export const slots = Router();

const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;

const SlotCreate = z.object({
  courseId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(hhmm, "HH:MM"),
  endTime: z.string().regex(hhmm, "HH:MM"),
  room: z.string().optional(),
});

slots.get("/", async (req, res) => {
  const { courseId } = req.query as { courseId?: string };
  const where = courseId ? { courseId } : {};
  const data = await prisma.courseSlot.findMany({ where });
  res.json(data);
});

slots.post("/", async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room } = SlotCreate.parse(req.body);

    if (startTime >= endTime) {
      return res.status(400).json({ message: "startTime endTime'den küçük olmalı" });
    }

    const s = await prisma.courseSlot.create({
      data: { courseId, dayOfWeek, startTime, endTime, room },
    });

    res.status(201).json(s);
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ errors: err.issues });
    }
    return res.status(500).json({ message: "unexpected_error" });
  }
});

slots.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.courseSlot.delete({ where: { id } });
  res.status(204).end();
});