import express from "express";
import cors from "cors";
import path from "path";
import { solveRouter } from "./routes.solve";
import { imageRouter } from "./routes.image";

const app = express();

app.use(cors());
app.use(express.json());

// Static files (optional)
app.use(express.static(path.join(process.cwd(), "public")));

// Test route
app.get("/", (_req, res) => {
  res.send("Backend is running! /api/solve ve /api/parse-image aktif.");
});

// Routers
app.use("/api/solve", solveRouter);
app.use("/api/parse-image", imageRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
