import { useMemo } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const ROW_HEIGHT_PX = 24;
const TIME_STEP_MINUTES = 30;
const GAP_PX = 6; // small breathing room between blocks

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function colorForCourse(name: string): string {
  const BLOCK_COLORS = ["#5B8DEF", "#4FD1C5", "#A78BFA", "#34D399", "#F59E0B", "#F472B6"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i += 1) {
    hash = (hash * 31 + (name || "").charCodeAt(i)) >>> 0;
  }
  return BLOCK_COLORS[hash % BLOCK_COLORS.length];
}

export default function ScheduleGrid({
  items,
  start = "09:00",
  end = "17:00",
}: {
  items: Array<{
    id?: string;
    courseName?: string;
    courseCode?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string | null;
  }>;
  start?: string;
  end?: string;
}) {
  // compute time grid
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const height = ((endMin - startMin) / TIME_STEP_MINUTES) * ROW_HEIGHT_PX;
  const labels = [] as string[];
  for (let m = startMin; m <= endMin; m += TIME_STEP_MINUTES) labels.push(minutesToTime(m));

  const { byDay, columnCount } = useMemo(() => {
    const raw = items
      .map((it) => {
        const dayIndex = (it.dayOfWeek ?? 1) - 1; // assume 1=Mon
        if (dayIndex < 0 || dayIndex >= DAY_LABELS.length) return null;
        const s = timeToMinutes(it.startTime);
        const e = timeToMinutes(it.endTime);
        if (isNaN(s) || isNaN(e) || e <= s) return null;
        const top = ((Math.max(s, startMin) - startMin) / TIME_STEP_MINUTES) * ROW_HEIGHT_PX;
        const rawHeight = ((Math.min(e, endMin) - Math.max(s, startMin)) / TIME_STEP_MINUTES) * ROW_HEIGHT_PX;
        const heightPx = Math.max(8, rawHeight - GAP_PX); // keep text visible
        const color = colorForCourse(it.courseName || it.courseCode || "Course");
        return {
          key: `${it.courseCode ?? it.courseName}-${it.dayOfWeek}-${it.startTime}-${it.endTime}-${it.id ?? Math.random()}`,
          dayIndex,
          top,
          height: Math.max(4, heightPx),
          color,
          title: it.courseCode ?? it.courseName ?? "",
          subtitle: it.room || "",
        };
      })
      .filter(Boolean) as Array<{
        key: string;
        dayIndex: number;
        top: number;
        height: number;
        color: string;
        title: string;
        subtitle: string;
      }>;

    const byDay: Array<typeof raw> = Array.from({ length: DAY_LABELS.length }).map(() => []);
    for (const r of raw) byDay[r.dayIndex].push(r);

    // sort and nudge overlapping events per day
    for (let di = 0; di < byDay.length; di += 1) {
      byDay[di].sort((a, b) => a.top - b.top);
      let prevBottom = -Infinity;
      for (const ev of byDay[di]) {
        if (ev.top < prevBottom + GAP_PX) {
          ev.top = prevBottom + GAP_PX;
        }
        prevBottom = ev.top + ev.height;
      }
    }

    return { byDay, columnCount: DAY_LABELS.length };
  }, [items, startMin, endMin]);

  const INNER_PADDING = GAP_PX;

  return (
    <div className="schedule-grid" style={{ marginTop: 8 }}>
      <div className="schedule-header-row">
        <div className="schedule-time-col"></div>
        {DAY_LABELS.map((d) => (
          <div className="schedule-day-col" key={d}>{d}</div>
        ))}
      </div>

      <div className="schedule-body">
        <div className="schedule-time-track" style={{ height: `${height}px` }}>
          {labels.map((lab, idx) => {
            const top = Math.min(Math.max(idx * ROW_HEIGHT_PX, 6), height - 6);
            return (
              <div key={lab} className="schedule-time-label" style={{ top: `${top}px` }}>{lab}</div>
            );
          })}
        </div>

        <div className="schedule-canvas" style={{ height: `${height}px` }}>
          <div className="schedule-day-columns" style={{ height: '100%' }}>
            {Array.from({ length: columnCount }).map((_, di) => (
              <div className="schedule-day-body" key={di}>
                {/* horizontal grid lines */}
                {labels.map((_, idx) => (
                  <div key={idx} className="schedule-line" style={{ top: `${idx * ROW_HEIGHT_PX}px` }} />
                ))}

                {/* events for this day */}
                {byDay[di].map((ev) => (
                  <div
                    key={ev.key}
                    className="sched-block"
                    style={{
                      top: ev.top + GAP_PX / 2,
                      height: ev.height - GAP_PX / 2,
                      left: INNER_PADDING,
                      right: INNER_PADDING,
                      backgroundColor: `${ev.color}22`,
                      borderColor: ev.color,
                      boxShadow: `0 10px 26px ${ev.color}33`,
                      paddingTop: GAP_PX / 2,
                      paddingBottom: GAP_PX / 2,
                    }}
                  >
                    <div className="sched-block-title">{ev.title}</div>
                    {ev.subtitle && <div className="sched-block-sub">{ev.subtitle}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
