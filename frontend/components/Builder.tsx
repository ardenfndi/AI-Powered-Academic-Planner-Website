import { useMemo } from "react";
import { usePlanner } from "../store/usePlanner";
import CourseForm from "./CourseForm";
import WeeklyGrid from "./WeeklyGrid";

export default function Builder() {
  const { courses, slots, placed, loading, error } = usePlanner();

  const preview = useMemo(() => {
    return slots.map(s => {
      const c = courses.find(x => x.id === s.courseId);
      return {
        courseId: s.courseId,
        courseName: c?.name || "Bilinmeyen",
        dayOfWeek: s.dayOfWeek,
        start: s.start,
        end: s.end,
        room: s.room
      };
    });
  }, [slots, courses]);

  return (
    <div className="container" style={{display:'grid', gap:16}}>
      <h2 className="title">Planner Builder</h2>
      <CourseForm />
      <div className="row" style={{alignItems:'stretch'}}>
        <div className="card" style={{flex:1, minWidth:0}}>
          <h3 className="title">Taslak</h3>
          <WeeklyGrid items={preview}/>
        </div>
        <div className="card" style={{flex:1, minWidth:0}}>
          <h3 className="title">Çözüm</h3>
          {loading ? <div className="muted">Hesaplanıyor...</div>
                   : placed.length ? <WeeklyGrid items={placed}/>
                   : <div className="muted">Henüz çözüm yok.</div>}
          {error && <div className="danger">{error}</div>}
        </div>
      </div>
    </div>
  );
}
