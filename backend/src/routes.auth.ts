import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { AuthedRequest, clearAuthToken, getUserIdFromRequest, issueAuthToken } from "./auth";

const router = express.Router();

// Helper to sanitize user object returned to client
function safeUser(u: any) {
  if (!u) return null;
  const { id, name, email, school, department, createdAt } = u;
  return { id, name, email, school: school ?? null, department: department ?? null, createdAt };
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, school, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, school: school ?? null, department: department ?? null } });

    issueAuthToken(res, user.id);

    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    issueAuthToken(res, user.id);
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  clearAuthToken(res);
  return res.json({ ok: true });
});

// Me
router.get("/me", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthedRequest);
    if (!userId) return res.status(401).json({ user: null });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      clearAuthToken(res);
      return res.status(401).json({ user: null });
    }
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ user: null });
  }
});

export { router as authRouter };
