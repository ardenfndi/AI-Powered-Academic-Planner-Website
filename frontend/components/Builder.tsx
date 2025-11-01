import { useMemo } from "react";
import { usePlanner } from "../store/usePlanner";
import CourseForm from "./CourseForm";
import Button from "./Button";

const DAY_NAME: Record<0|1|2|3|4|5|6, string> = {
  0: "Pazar",
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
  6: "Cumartesi",
};
const DAY_ORDER = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const dayIdx = (d: string) => DAY_ORDER.indexOf(d);

export default function Builder() {
  const { courses, slots, error, removeSlot } = usePlanner();

  // Görüntülenecek satırlar: ders adı, gün, saat, sınıf  + id
  const rows = useMemo(() => {
    const data = slots.map(s => {
      const c = courses.find(x => x.id === s.courseId);
      return {
        id: s.id,
        course: c?.name ?? "Bilinmeyen",
        day: DAY_NAME[s.dayOfWeek as 0|1|2|3|4|5|6],
        start: s.start,
        end: s.end,
        time: `${s.start}-${s.end}`,
        room: s.room ?? ""
      };
    });

    // Gün + saat sıralı
    return data.sort((a,b) => {
      const da = dayIdx(a.day) - dayIdx(b.day);
      if (da !== 0) return da;
      return a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.course.localeCompare(b.course);
    });
  }, [slots, courses]);

  return (
    <div className="container" style={{ display: "grid", gap: 16 }}>
      <h2 className="title">Taslak</h2>

      <CourseForm />

      <div className="card" style={{ overflowX: "auto" }}>
        <h3 className="title">Girilen Dersler</h3>

        {rows.length === 0 ? (
          <div className="muted">Henüz bir şey eklemedin. Üstten ders ve saat gir.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
              gap: 8,
              alignItems: "center"
            }}
          >
            {/* Header */}
            <div style={{ fontWeight: 700, opacity: 0.9 }}>Ders adı</div>
            <div style={{ fontWeight: 700, opacity: 0.9 }}>Gün</div>
            <div style={{ fontWeight: 700, opacity: 0.9 }}>Saat</div>
            <div style={{ fontWeight: 700, opacity: 0.9 }}>Sınıf</div>
            <div style={{ fontWeight: 700, opacity: 0.9, textAlign: "right" }}>İşlem</div>

            {/* Rows */}
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  gridColumn: "1 / -1",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "#0f141a",
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
                    gap: 8,
                    alignItems: "center"
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{r.course}</div>
                  <div>{r.day}</div>
                  <div>{r.time}</div>
                  <div>{r.room}</div>
                  <div style={{ textAlign: "right" }}>
                    <Button className="btn" onClick={() => removeSlot(r.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="danger" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
