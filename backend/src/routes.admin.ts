import express from "express";
import { prisma } from "./prisma";
import { requireAuth, requireAdmin } from "./auth";

const router = express.Router();

// Apply auth + admin guard to all admin endpoints
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/overview
router.get("/overview", async (_req, res) => {
  try {
    const usersCount = await prisma.user.count();
    const schedulesCount = await prisma.savedSchedule.count();
    res.json({ usersCount, schedulesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

// GET /api/admin/users
router.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    const payload = await Promise.all(
      users.map(async (u) => {
        const schedulesCount = await prisma.savedSchedule.count({ where: { userId: u.id } });
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
          role: (u as any).role ?? "user",
          schedulesCount,
        };
      })
    );
    res.json({ users: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

export { router as adminRouter };
