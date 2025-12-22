import React, { useMemo } from "react";
import "./WeeklySchedule.css";

export type Day = "MON" | "TUE" | "WED" | "THU" | "FRI";

export type ScheduleBlock = {
  id: string;
  day: Day;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  code: string;
  subtitle?: string;
  accent?: "purple" | "orange" | "blue" | "pink";
};

type PreparedBlock = ScheduleBlock & {
  rowStart: number;
  rowSpan: number;
  dayIndex: number;
  startLabel: string;
  endLabel: string;
  accent: NonNullable<ScheduleBlock["accent"]>;
};

const DAYS: Day[] = ["MON", "TUE", "WED", "THU", "FRI"];

const parseTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};

const roundToNearest30 = (minutes: number) => Math.round(minutes / 30) * 30;

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const accentPalette = {
  purple: { base: "#8a79ff", glow: "rgba(149, 126, 255, 0.8)" },
  orange: { base: "#f7b04a", glow: "rgba(252, 191, 104, 0.8)" },
  blue: { base: "#5fb8ff", glow: "rgba(119, 196, 255, 0.85)" },
  pink: { base: "#ff5fa2", glow: "rgba(255, 133, 186, 0.85)" },
};

export default function WeeklySchedule(props: {
  blocks: ScheduleBlock[];
  startHour?: number;
  endHour?: number;
}) {
  const startHour = props.startHour ?? 9;
  const endHour = props.endHour ?? 18;

  const baseMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  const halfHourCount = Math.max(1, (endHour - startHour) * 2);
  const gridHeight = 52 + halfHourCount * 40;

  const slots = useMemo(() => {
    const list: { label: string; row: number; isHour: boolean }[] = [];
    for (let i = 0; i <= halfHourCount; i++) {
      const minutes = baseMinutes + i * 30;
      list.push({
        label: formatMinutes(minutes),
        row: 2 + i,
        isHour: minutes % 60 === 0,
      });
    }
    return list;
  }, [baseMinutes, halfHourCount]);

  const preparedBlocks = useMemo<PreparedBlock[]>(() => {
    return props.blocks
      .map((block) => {
        const dayIndex = DAYS.indexOf(block.day);
        if (dayIndex === -1) return null;

        const startAligned = roundToNearest30(parseTime(block.start));
        const endAligned = roundToNearest30(parseTime(block.end));

        const clampedStart = Math.max(baseMinutes, Math.min(endMinutes, startAligned));
        const clampedEnd = Math.max(baseMinutes, Math.min(endMinutes, endAligned));
        if (clampedEnd <= clampedStart) return null;

        const rowStart = 2 + (clampedStart - baseMinutes) / 30;
        const rowSpan = Math.max(1, (clampedEnd - clampedStart) / 30);

        return {
          ...block,
          rowStart,
          rowSpan,
          dayIndex,
          startLabel: formatMinutes(clampedStart),
          endLabel: formatMinutes(clampedEnd),
          accent: block.accent ?? "purple",
        };
      })
      .filter(Boolean) as PreparedBlock[];
  }, [props.blocks, baseMinutes, endMinutes]);

  return (
    <div className="weekly-schedule">
      <div className="schedule-frame">
        <div className="grid-scroll">
          <div
            className="schedule-grid"
            style={{
              gridTemplateColumns: "90px repeat(5, 1fr)",
              gridTemplateRows: `52px repeat(${halfHourCount}, 40px) 0px`,
              height: `${gridHeight}px`,
            }}
          >
            <div className="grid-backdrop" style={{ height: `${gridHeight - 52}px`, top: "52px" }}>
              <div className="grid-vertical" />
            </div>

            <div className="corner-cell" />

            {DAYS.map((day, idx) => (
              <div key={day} className="day-header" style={{ gridColumn: idx + 2 }}>
                {day}
              </div>
            ))}

            {slots.map((slot, i) => (
              <div
                key={`${slot.label}-${i}`}
                className={`time-label ${slot.isHour ? "hour" : "half"}`}
                style={{ gridRow: slot.row }}
              >
                {slot.label}
              </div>
            ))}

            {preparedBlocks.map((block) => {
              const accent = accentPalette[block.accent];
              return (
                <div
                  key={block.id}
                  className="schedule-block"
                  style={{
                    gridColumn: `${block.dayIndex + 2}`,
                    gridRow: `${block.rowStart} / span ${block.rowSpan}`,
                    "--accent-base": accent.base,
                    "--accent-glow": accent.glow,
                  } as React.CSSProperties}
                >
                  <div className="block-time">
                    {block.startLabel} – {block.endLabel}
                  </div>
                  <div className="block-title">{block.code}</div>
                  {block.subtitle && <div className="block-subtitle">{block.subtitle}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
