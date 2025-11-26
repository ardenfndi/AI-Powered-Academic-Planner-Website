import { Router } from "express";
import { ai } from "./client.openai";

export const aiRoutes = Router();

aiRoutes.post("/schedule", async (req, res) => {
  try {
    const { courses } = req.body;

    const prompt = `
      You are an AI schedule generator.
      Given these courses and their time slots, pick one conflict-free slot for each course.
      Respond ONLY in JSON.

      Courses:
      ${JSON.stringify(courses, null, 2)}
    `;

    const completion = await ai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});
