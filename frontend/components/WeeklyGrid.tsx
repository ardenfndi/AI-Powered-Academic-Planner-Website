import React from "react";

export type DayOfWeek = 0|1|2|3|4|5|6; // 0=Pazar
export type PlacedItem = {
  courseId: string;
  courseName: string;
  dayOfWeek: DayOfWeek;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  room?: string | null;
};

const days = ["Paz","Pts","Sal","Çar","Per","Cum","Cts"]; // 0..6

function toMinutes(hhmm: string) {
  const [h,m] = hhmm.split(':').map(Number);
  return h*60+m;
}

type Props = {
  items: PlacedItem[];
  startHour?: number; // default 8
  endHour?: number;   // default 21
  stepMin?: number;   // default 30
};

export default function WeeklyGrid({ items, startHour=8, endHour=21, stepMin=30 }: Props) {
  const rows = ((endHour-startHour)*60)/stepMin;

  return (
    <div className="card grid-wrap">
      <div className="grid">
        {/* Header */}
        <div />
        {days.map(d => <div key={d} className="grid-day">{d}</div>)}

        {/* Time rows + cells */}
        {Array.from({length: rows}).map((_,i) => {
          const minutes = startHour*60 + i*stepMin;
          const h = Math.floor(minutes/60).toString().padStart(2,'0');
          const m = (minutes%60).toString().padStart(2,'0');
          return (
            <React.Fragment key={i}>
              <div className="grid-time">{h}:{m}</div>
              {Array.from({length:7}).map((__,d) => (
                <div key={`${i}-${d}`} className="grid-cell" />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* Overlay events */}
      <div style={{position:'relative', marginTop: -rows*30}}>
        {items.map((it, idx) => {
          const start = toMinutes(it.start);
          const end = toMinutes(it.end);
          const topMin = start - startHour*60;
          const heightMin = end - start;
          const top = (topMin/stepMin)*30 + 30;            // header offset
          const colLeft = it.dayOfWeek;                    // 0..6
          const colWidth = 100/8;                          // 8 kolon (time + 7 day)

          return (
            <div
              key={idx}
              className="grid-event"
              style={{
                left: `calc(${(colLeft+1)*colWidth}% + 6px)`,
                width: `calc(${colWidth}% - 12px)`,
                top,
                height: (heightMin/stepMin)*30 - 4
              }}
            >
              <div className="grid-event-title">{it.courseName}</div>
              <div className="grid-event-meta">
                {it.start}–{it.end}{it.room ? ` · ${it.room}`:''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
