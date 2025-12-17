import { useState } from "react";
import { usePlanner } from "../store/usePlanner";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";
import type { DayOfWeek } from "../store/usePlanner";

function dayNameToNumber(name: string): DayOfWeek {
  switch (name) {
    case "Monday":
      return 1;
    case "Tuesday":
      return 2;
    case "Wednesday":
      return 3;
    case "Thursday":
      return 4;
    case "Friday":
      return 5;
    case "Saturday":
      return 6;
    default:
      return 0; // Sunday
  }
}

export default function Builder() {
  const addCourseAndReturn = usePlanner((s) => s.addCourseAndReturn);
  const addSlotLocal = usePlanner((s) => s.addSlotLocal);
  const language = usePreferences((s) => s.language);

  const [course, setCourse] = useState("");
  const [day, setDay] = useState("Monday");
  const [startHour, setStartHour] = useState("10");
  const [startMin, setStartMin] = useState("00");
  const [endHour, setEndHour] = useState("11");
  const [endMin, setEndMin] = useState("00");
  const [room, setRoom] = useState("");

  const hours = Array.from({ length: 24 }).map((_, i) => (
    <option key={i}>{i.toString().padStart(2, "0")}</option>
  ));
  const minutes = Array.from({ length: 60 }).map((_, i) => (
    <option key={i}>{i.toString().padStart(2, "0")}</option>
  ));

  async function handleAdd() {
    const trimmed = course.trim();
    if (!trimmed) return;

    const c = await addCourseAndReturn(trimmed);
    const dayNum = dayNameToNumber(day);

    await addSlotLocal({
      courseId: c.id,
      dayOfWeek: dayNum,
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`,
      room: room || null,
    });

    setRoom("");
  }

  return (
    <div className="builder-container">
      <div className="builder-form">
        {/* ROW 1 – COURSE NAME */}
        <input
          type="text"
          className="builder-course"
          placeholder="Course name (e.g., CS302)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        {/* ROW 2 – DAY + TIME */}
        <div className="builder-row">
          <select
            className="builder-day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
          </select>

          <select
            className="time-select"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          >
            {hours}
          </select>

          <select
            className="time-select"
            value={startMin}
            onChange={(e) => setStartMin(e.target.value)}
          >
            {minutes}
          </select>

          <select
            className="time-select"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          >
            {hours}
          </select>

          <select
            className="time-select"
            value={endMin}
            onChange={(e) => setEndMin(e.target.value)}
          >
            {minutes}
          </select>
        </div>

        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="builder-room"
          style={{ width: "100%" }}
        />
      </div>

      <div className="builder-actions">
        <button className="primary-btn add-btn" onClick={handleAdd}>
          {t(language, "button.addCourseSlot")}
        </button>
      </div>
    </div>
  );
}
