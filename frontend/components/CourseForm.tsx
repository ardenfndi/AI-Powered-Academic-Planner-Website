import React, { useState } from "react";
import { usePlanner, type DayOfWeek } from "../store/usePlanner";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

const dayOptions = [
  {v:1, t:"Pazartesi"}, {v:2, t:"Salı"}, {v:3, t:"Çarşamba"},
  {v:4, t:"Perşembe"}, {v:5, t:"Cuma"}, {v:6, t:"Cumartesi"}, {v:0, t:"Pazar"},
];

export default function CourseForm() {
  const { addCourse, addSlotLocal, courses } = usePlanner();
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [day, setDay] = useState<DayOfWeek>(1);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");
  const [room, setRoom] = useState("");

  const onAddCourse = () => {
    if (!name.trim()) return;
    addCourse(name.trim());
    setName("");
  };

  const onAddSlot = () => {
    if (!courseId) return;
    addSlotLocal({ courseId, dayOfWeek: day, start, end, room });
  };

  return (
    <div className="card" style={{display:'grid', gap:12}}>
      <div className="row">
        <Input placeholder="Ders adı (örn: CS302)" value={name}
               onChange={e=>setName(e.target.value)} style={{flex:1}} />
        <Button onClick={onAddCourse}>Ders ekle</Button>
      </div>

      <div className="row">
        <Select value={courseId} onChange={e=>setCourseId(e.target.value)}>
          <option value="">Ders seç</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <Select value={day} onChange={e=>setDay(Number(e.target.value) as DayOfWeek)}>
          {dayOptions.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
        </Select>

        <Input type="time" value={start} onChange={e=>setStart(e.target.value)} />
        <Input type="time" value={end} onChange={e=>setEnd(e.target.value)} />
        <Input placeholder="Oda (ops.)" value={room} onChange={e=>setRoom(e.target.value)} />
        <Button onClick={onAddSlot}>Slot ekle</Button>
      </div>
    </div>
  );
}
