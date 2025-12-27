import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { courses } from "./routes.courses";
import { slots } from "./routes.slots";
import { solveRouter } from "./routes.solve";
import { imageRouter } from "./routes.image";
import { schedulesRouter } from "./routes.schedules";
import { authRouter } from "./routes.auth";
import { adminRouter } from "./routes.admin";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve public assets
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.send(
    'Planner API is running. Try <a href="/health">/health</a> or <code>/api/courses</code>.'
  );
});

app.use("/api/courses", courses);
app.use("/api/slots", slots);
app.use("/api/solve", solveRouter);
app.use("/api/parse-image", imageRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// On startup, ensure demo admin exists if env variables provided
async function ensureDemoAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("No demo admin configured (ADMIN_EMAIL/ADMIN_PASSWORD missing)");
    return;
  }

  try {
    console.log(`Checking demo admin account for ${adminEmail}`);
    const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!exists) {
      console.log("No demo admin found — creating one.");
      const hashed = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({ data: { name: "Admin", email: adminEmail, password: hashed, role: "admin" } as any });
      console.log(`Demo admin created: ${adminEmail}`);
    } else {
      console.log(`Found user record for ${adminEmail}`);
      if ((exists as any).role !== "admin") {
        console.log(`User exists but is not admin (role=${(exists as any).role}). Promoting to admin.`);
        await prisma.user.update({ where: { id: exists.id }, data: { role: "admin" } as any });
        console.log(`Existing user promoted to admin: ${adminEmail}`);
      } else {
        console.log("Demo admin exists and is already admin");
      }
    }
  } catch (err) {
    console.error("Failed to ensure demo admin", err);
  }
}

// Trigger seeding and wait for it before listening so demo admin exists immediately
(async () => {
  try {
    await ensureDemoAdmin();
  } catch (err) {
    console.error("Error ensuring demo admin:", err);
  }
})();

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "planner-api",
    ts: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`planner-api listening on http://localhost:${PORT}`);
});
