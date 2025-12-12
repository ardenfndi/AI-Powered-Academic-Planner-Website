import { Router } from "express";
import multer from "multer";
import { ai } from "./client.openai";

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

    return res.json(parsed);
  } catch (err: any) {
    console.error("POST /api/parse-image error:", err);
    return res.status(500).json({
      error: "Failed to parse image",
      detail: err?.message ?? "Unknown error",
    });
  }
});
