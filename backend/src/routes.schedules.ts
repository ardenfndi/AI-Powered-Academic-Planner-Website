import { Router } from "express";
import { prisma } from "./prisma";
import { AuthedRequest, requireAuth } from "./auth";

export const schedulesRouter = Router();

schedulesRouter.use(requireAuth);

// POST /api/schedules
// Body: { explanation?: string, items: Array<{ courseName, courseCode?, section?, dayOfWeek, startTime, endTime, room }> }
schedulesRouter.post("/", async (req, res) => {
  try {
    const { explanation, items, payload } = req.body as any;
    const userId = (req as AuthedRequest).userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" });
    }

    const mappedItems = items.map((it: any) => ({
      courseCode: it.courseCode ?? null,
      courseName: it.courseName ?? null,
      section: it.section ?? null,
      dayOfWeek: it.dayOfWeek,
      startTime: it.startTime,
      endTime: it.endTime,
      room: it.room ?? null,
    }));

    const created = await prisma.savedSchedule.create({
      data: {
        userId,
        explanation: explanation ?? null,
        payload: payload ? JSON.stringify(payload) : JSON.stringify({ items, explanation }),
        items: { create: mappedItems },
      },
      select: { id: true },
    });

    res.status(201).json({ id: created.id });
  } catch (err) {
    console.error("POST /api/schedules error:", err);
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

// GET /api/schedules - list summary
schedulesRouter.get("/", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const list = await prisma.savedSchedule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, explanation: true },
    });
    res.json(list);
  } catch (err) {
    console.error("GET /api/schedules error:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// GET /api/schedules/me - list summary (alias)
schedulesRouter.get("/me", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const list = await prisma.savedSchedule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, explanation: true },
    });
    res.json(list);
  } catch (err) {
    console.error("GET /api/schedules/me error:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// GET /api/schedules/:id - full schedule
schedulesRouter.get("/:id", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    const schedule = await prisma.savedSchedule.findUnique({
      where: { id, userId },
      include: { items: true },
    });
    if (!schedule) return res.status(404).json({ error: "Not found" });
    res.json(schedule);
  } catch (err) {
    console.error("GET /api/schedules/:id error:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

export default schedulesRouter;
