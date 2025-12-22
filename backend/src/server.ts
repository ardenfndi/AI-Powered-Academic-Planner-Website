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
