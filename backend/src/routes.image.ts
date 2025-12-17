import { Router } from "express";
import multer from "multer";
import { ai } from "./client.openai";
import { prisma } from "./prisma";

const upload = multer({ storage: multer.memoryStorage() });

export const imageRouter = Router();

// Simple file shape; avoiding Express.Multer types
type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
};

imageRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    // Multer file
    const file = (req as any).file as UploadedFile | undefined;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const base64 = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    const prompt = `
You are given a photo of a university course schedule.
Extract all courses and their time slots.
Return ONLY a JSON object with this exact shape:

{
  "plainText": string,
  "courses": [{ "name": string }],
  "slots": [
    {
      "courseName": string,
      "dayOfWeek": string,
      "start": "HH:mm",
      "end": "HH:mm",
      "room": string | null
    }
  ]
}

Use English day names like Monday, Tuesday, Wednesday, Thursday, Friday.
`.trim();

    const completion = await ai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const content: any = completion.choices?.[0]?.message?.content;

    if (!content) {
      return res
        .status(500)
        .json({ error: "Empty response from AI while parsing image" });
    }

    // response_format: json_object usually returns JSON text but can be array/text
    let parsed: any;

    if (typeof content === "string") {
      parsed = JSON.parse(content);
    } else if (Array.isArray(content)) {
      const first = (content as any)[0];
      if (first && typeof first.text === "string") {
        parsed = JSON.parse(first.text);
      } else {
        parsed = first;
      }
    } else {
      parsed = content;
    }

    // Persist to DB with dedupe (course by code/name, slot by composite)
    const courses = Array.isArray(parsed.courses) ? parsed.courses : [];
    const slots = Array.isArray(parsed.slots) ? parsed.slots : [];

    // Upsert courses first
    const courseIdByName = new Map<string, string>();
    for (const c of courses) {
      if (!c?.name) continue;
      const upserted = await prisma.course.upsert({
        where: { code: c.name },
        update: { name: c.name },
        create: { code: c.name, name: c.name },
      });
      courseIdByName.set(c.name.trim().toLowerCase(), upserted.id);
    }

    // Helper to map day name to number
    const dayNameToNumber = (name: string): number | null => {
      switch (name?.toLowerCase()) {
        case "sunday":
          return 0;
        case "monday":
          return 1;
        case "tuesday":
          return 2;
        case "wednesday":
          return 3;
        case "thursday":
          return 4;
        case "friday":
          return 5;
        case "saturday":
          return 6;
        default:
          return null;
      }
    };

    let created = 0;
    let skipped = 0;

    for (const s of slots) {
      const day = dayNameToNumber(s.dayOfWeek);
      if (
        !s ||
        !s.courseName ||
        day === null ||
        !s.start ||
        !s.end
      ) {
        skipped += 1;
        continue;
      }

      // ensure course exists
      const key = s.courseName.trim().toLowerCase();
      let courseId = courseIdByName.get(key);
      if (!courseId) {
        const upserted = await prisma.course.upsert({
          where: { code: s.courseName },
          update: { name: s.courseName },
          create: { code: s.courseName, name: s.courseName },
        });
        courseId = upserted.id;
        courseIdByName.set(key, courseId);
      }

      try {
        await prisma.courseSlot.upsert({
          where: {
            courseId_dayOfWeek_startTime_endTime_room: {
              courseId,
              dayOfWeek: day,
              startTime: s.start,
              endTime: s.end,
              room: s.room ?? null,
            },
          },
          update: {},
          create: {
            courseId,
            dayOfWeek: day,
            startTime: s.start,
            endTime: s.end,
            room: s.room ?? null,
          },
        });
        created += 1;
      } catch {
        skipped += 1;
      }
    }

    return res.json({
      plainText: parsed.plainText ?? "",
      courses,
      slots,
      created,
      skipped,
    });
  } catch (err: any) {
    console.error("POST /api/parse-image error:", err);
    return res.status(500).json({
      error: "Failed to parse image",
      detail: err?.message ?? "Unknown error",
    });
  }
});
