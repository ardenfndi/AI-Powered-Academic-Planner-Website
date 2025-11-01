import * as path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { courses } from "./routes.courses";
import { slots } from "./routes.slots";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), "public")));
app.get("/", (_req, res) => {
  res.send("Planner API is running. Try <a href=\"/health\">/health</a> or <code>/api/courses</code>.");
});

app.use("/api/courses", courses);
app.use("/api/slots", slots);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "planner-api", ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`planner-api listening on http://localhost:${PORT}`);
});