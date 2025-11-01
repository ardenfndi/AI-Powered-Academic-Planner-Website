import { Router } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

export const courses = Router();

const CourseCreate = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});

// Listele
courses.get("/", async (_req, res) => {
  const data = await prisma.course.findMany({ include: { slots: true } });
  res.json(data);
});

// Ekle
courses.post("/", async (req, res) => {
  try {
    const { code, name } = CourseCreate.parse(req.body); // parse -> tip kesinleşir
    const c = await prisma.course.create({ data: { code, name } });
    res.status(201).json(c);
  } catch (err: any) {
    if (err?.issues) {
      // Zod hatası
      return res.status(400).json({ errors: err.issues });
    }
    return res.status(500).json({ message: "unexpected_error" });
  }
});

// Sil
courses.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.courseSlot.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });
  res.status(204).end();
});