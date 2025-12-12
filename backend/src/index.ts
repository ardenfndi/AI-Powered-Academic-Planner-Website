import express from "express";
import cors from "cors";
import path from "path";
import { solveRouter } from "./routes.solve";
import { imageRouter } from "./routes.image";

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (_req, res) => {
  res.send("Backend is running! /api/solve and /api/parse-image are active.");
});

app.use("/api/solve", solveRouter);
app.use("/api/parse-image", imageRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
