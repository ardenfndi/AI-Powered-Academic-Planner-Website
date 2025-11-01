import React, { useMemo } from "react";
import Select from "./Select";

type Props = {
  value: string;                 // "HH:mm"
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  hourLabel?: string;
  minuteLabel?: string;
};

export default function TimeWheel({
  value,
  onChange,
  style,
  hourLabel,
  minuteLabel
}: Props) {
  const [hStr, mStr] = (value || "00:00").split(":");
  const hour = Math.max(0, Math.min(23, Number(hStr) || 0));
  const minute = Math.max(0, Math.min(59, Number(mStr) || 0));

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    []
  );

  const setHour = (h: string) => onChange(`${h}:${String(minute).padStart(2, "0")}`);
  const setMinute = (m: string) => onChange(`${String(hour).padStart(2, "0")}:${m}`);

  return (
    <div className="row" style={{ gap: 8, alignItems: "center", ...style }}>
      {hourLabel ? <span className="muted" style={{ minWidth: 0 }}>{hourLabel}</span> : null}
      <Select value={String(hour).padStart(2, "0")} onChange={e => setHour(e.target.value)} style={{ minWidth: 90 }}>
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </Select>
      {minuteLabel ? <span className="muted" style={{ minWidth: 0 }}>{minuteLabel}</span> : <span className="muted">:</span>}
      <Select value={String(minute).padStart(2, "0")} onChange={e => setMinute(e.target.value)} style={{ minWidth: 90 }}>
        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
      </Select>
    </div>
  );
}
