import React, { useMemo, useState } from "react";
import { usePlanner, type DayOfWeek, type Course } from "../store/usePlanner";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import TimeWheel from "./TimeWheel";

const dayOptions = [
  { v: 1, t: "Pazartesi" },
  { v: 2, t: "Salı" },
  { v: 3, t: "Çarşamba" },
  { v: 4, t: "Perşembe" },
  { v: 5, t: "Cuma" },
  { v: 6, t: "Cumartesi" },
  { v: 0, t: "Pazar" }
];

const norm = (s: string) => s.trim().toLowerCase();

export default function CourseForm() {
  const { courses, addCourseAndReturn, addSlotLocal } = usePlanner();

  const [courseName, setCourseName] = useState("");
  const [day, setDay] = useState<DayOfWeek>(1);
  const [start, setStart] = useState("10:00");
  const [end,   setEnd]   = useState("11:00");
  const [room,  setRoom]  = useState("");

  const existingCourse: Course | undefined = useMemo(() => {
    const key = norm(courseName);
    if (!key) return undefined;
    return courses.find(c => norm(c.name) === key);
  }, [courses, courseName]);

  const onAddSlot = () => {
    const name = courseName.trim();
    if (!name) return;
    const course = existingCourse ?? addCourseAndReturn(name);
    addSlotLocal({ courseId: course.id, dayOfWeek: day, start, end, room });
  };

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div
        className="row"
        style={{
          gap: 12,
          alignItems: "center",
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 2
        }}
      >
        <Input
          placeholder="Ders (örn: CS302)"
          value={courseName}
          onChange={e => setCourseName(e.target.value)}
          style={{ flex: "1 1 280px", minWidth: 240 }}
        />

        <Select
          value={day}
          onChange={e => setDay(Number(e.target.value) as DayOfWeek)}
          style={{ flex: "0 0 150px" }}
        >
          {dayOptions.map(o => (
            <option key={o.v} value={o.v}>{o.t}</option>
          ))}
        </Select>

        {/* Saat belirleme: wheel tarzı iki dropdown (saat + dakika) */}
        <TimeWheel value={start} onChange={setStart} style={{ flex: "0 0 210px" }} />
        <TimeWheel value={end}   onChange={setEnd}   style={{ flex: "0 0 210px" }} />

        <Input
          placeholder="Oda (ops.)"
          value={room}
          onChange={e => setRoom(e.target.value)}
          style={{ flex: "0 0 160px", minWidth: 140 }}
        />

        <Button
          onClick={onAddSlot}
          style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}
        >
          Slot ekle
        </Button>
      </div>
    </div>
  );
}
