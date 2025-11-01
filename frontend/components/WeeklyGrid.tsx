import React, { useMemo } from "react";
import type { PlacedItem, DayOfWeek } from "../store/usePlanner";

const DAYS_TR = ["Paz","Pts","Sal","Çar","Per","Cum","Cts"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(s => Number(s.trim()));
  return h * 60 + m;
};
const floorTo = (x: number, step: number) => Math.floor(x / step) * step;
const ceilTo  = (x: number, step: number) => Math.ceil(x / step) * step;

// Sabitler: CSS ile eşleşiyor
const ROW_H = 32;     // her zaman satır yüksekliği
const HEADER_H = 36;  // gün başlığı yüksekliği

type Props = {
  items: PlacedItem[];
  stepMin?: number; // 30
};

/** Aynı gün çakışanları lane'lere böler. */
function assignLanes(items: PlacedItem[]) {
  const byDay: Record<number, PlacedItem[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
  items.forEach(it => byDay[it.dayOfWeek].push(it));

  const withLane: Array<{ item: PlacedItem; lane: number }> = [];
  const laneCounts: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};

  for (let d = 0; d < 7; d++) {
    const list = byDay[d].slice().sort((a,b) => toMin(a.start) - toMin(b.start));
    const lanes: Array<{ end: number }> = [];
    for (const it of list) {
      const s = toMin(it.start);
      const e = toMin(it.end);
      let placed = -1;
      for (let i = 0; i < lanes.length; i++) {
        if (s >= lanes[i].end) { placed = i; lanes[i].end = e; break; }
      }
      if (placed === -1) { lanes.push({ end: e }); placed = lanes.length - 1; }
      withLane.push({ item: it, lane: placed });
    }
    laneCounts[d] = Math.max(1, lanes.length);
  }
  return { withLane, laneCounts };
}

export default function WeeklyGrid({ items, stepMin = 30 }: Props) {
  const hasItems = items?.length > 0;

  // Dinamik zaman aralığı
  const { startMin, endMin } = useMemo(() => {
    if (!hasItems) return { startMin: 0, endMin: 0 };
    let minS = Infinity, maxE = -Infinity;
    for (const it of items) {
      const s = toMin(it.start), e = toMin(it.end);
      if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) continue;
      if (s < minS) minS = s;
      if (e > maxE) maxE = e;
    }
    if (!Number.isFinite(minS) || !Number.isFinite(maxE) || maxE <= minS) {
      return { startMin: 0, endMin: 0 };
    }
    return { startMin: floorTo(minS, stepMin), endMin: ceilTo(maxE, stepMin) };
  }, [items, hasItems, stepMin]);

  const rows = useMemo(() => {
    if (!hasItems || endMin <= startMin) return 0;
    return Math.max(1, Math.ceil((endMin - startMin) / stepMin));
  }, [startMin, endMin, stepMin, hasItems]);

  const { withLane, laneCounts } = useMemo(() => assignLanes(items), [items]);

  // Kart yüksekliği: header + satırlar
  const gridHeight = HEADER_H + rows * ROW_H;

  return (
    <div className="card grid-wrap" style={{ position: "relative", height: hasItems ? gridHeight : undefined }}>
      {/* GRID İSKELETİ */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "90px repeat(7, 1fr)",
          position: "relative",
          zIndex: 0
        }}
      >
        {/* Header */}
        <div style={{ height: HEADER_H }} />
        {DAYS_TR.map(d => (
          <div key={d} className="grid-day" style={{ height: HEADER_H, lineHeight: `${HEADER_H - 10}px` }}>
            {d}
          </div>
        ))}

        {/* Satırlar (sadece item varsa) */}
        {hasItems && rows > 0 && Array.from({ length: rows }).map((_, i) => {
          const minutes = startMin + i * stepMin;
          const h = String(Math.floor(minutes / 60)).padStart(2, "0");
          const m = String(minutes % 60).padStart(2, "0");
          return (
            <React.Fragment key={i}>
              <div className="grid-time" style={{ height: ROW_H, lineHeight: `${ROW_H}px` }}>{h}:{m}</div>
              {Array.from({ length: 7 }).map((__, d) => (
                <div key={`${i}-${d}`} className="grid-cell" style={{ height: ROW_H }} />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* EVENT OVERLAY */}
      {hasItems && rows > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2
          }}
        >
          {withLane.map(({ item, lane }) => {
            const s = toMin(item.start), e = toMin(item.end);
            if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;

            const topMin = s - startMin;
            const heightMin = e - s;

            const day = item.dayOfWeek as DayOfWeek;
            const lanesForDay = laneCounts[day];
            const colWidth = 100 / 8; // time + 7 gün
            const baseLeftPct = (day + 1) * colWidth;
            const laneWidthPct = colWidth / lanesForDay;
            const leftPct = baseLeftPct + lane * laneWidthPct;

            const top = HEADER_H + (topMin / stepMin) * ROW_H;

            return (
              <div
                key={`${item.courseId}-${day}-${item.start}-${item.end}-${lane}`}
                className="grid-event"
                style={{
                  position: "absolute",
                  left: `calc(${leftPct}% + 6px)`,
                  width: `calc(${laneWidthPct}% - 12px)`,
                  top,
                  height: Math.max(18, (heightMin / stepMin) * ROW_H - 4),
                  pointerEvents: "auto",
                  overflow: "hidden"
                }}
                title={`${item.courseName} ${item.start}–${item.end}${item.room ? ` · ${item.room}` : ""}`}
              >
                <div className="grid-event-title">{item.courseName}</div>
                <div className="grid-event-meta">
                  {item.start}–{item.end}{item.room ? ` · ${item.room}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
