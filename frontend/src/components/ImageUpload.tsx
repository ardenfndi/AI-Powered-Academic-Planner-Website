import { useState } from "react";
import { usePlanner } from "../store/usePlanner";
import type { DayOfWeek } from "../store/usePlanner";

type ParsedFromImage = {
  plainText: string;
  courses: { name: string }[];
  slots: {
    courseName: string;
    dayOfWeek: string; // "Monday"
    start: string;
    end: string;
    room?: string | null;
  }[];
};

// Convert a day name to DayOfWeek
function dayNameToNumber(name: string): DayOfWeek | null {
  switch (name.toLowerCase()) {
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
}

export default function ImageUpload() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addCourseAndReturn = usePlanner((s) => s.addCourseAndReturn);
  const addSlotLocal = usePlanner((s) => s.addSlotLocal);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      setText(null);

      const res = await fetch("http://localhost:4000/api/parse-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error");
      }

      const data: ParsedFromImage = await res.json();

      // Show readable text
      setText(
        data.plainText ||
          data.slots
            .map(
              (s) =>
                `${s.courseName} ${s.dayOfWeek} ${s.start}-${s.end} ${
                  s.room ?? ""
                }`,
            )
            .join(", "),
      );

      // Add courses first (if provided)
      if (Array.isArray(data.courses)) {
        for (const c of data.courses) {
          await addCourseAndReturn(c.name || "Untitled");
        }
      }

      // Add slots and ensure they reference an existing course
      for (const slot of data.slots) {
        const dayNumber = dayNameToNumber(slot.dayOfWeek);
        if (dayNumber === null) continue;

        const course = await addCourseAndReturn(slot.courseName || "Untitled");

        await addSlotLocal({
          courseId: course.id,
          dayOfWeek: dayNumber,
          start: slot.start,
          end: slot.end,
          room: slot.room ?? null,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Upload/parse failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        borderRadius: "12px",
        background: "var(--color-panel-end)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
        fontSize: "13px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: 600 }}>
        Fotoğraf tanımlı ders okuma (Beta)
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />

      {loading && <p style={{ marginTop: "8px" }}>Loading...</p>}

      {error && (
        <p style={{ marginTop: "8px", color: "#fca5a5" }}>{error}</p>
      )}

      {text && (
        <pre
          style={{
            marginTop: "8px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {text}
        </pre>
      )}
    </div>
  );
}
