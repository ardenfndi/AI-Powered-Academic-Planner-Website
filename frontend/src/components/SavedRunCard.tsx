import React from "react";

export default function SavedRunCard({
  run,
  active,
  onClick,
}: {
  run: { id: string; createdAt: string; explanation?: string; items?: any[] };
  active?: boolean;
  onClick: () => void;
}) {
  const d = new Date(run.createdAt);
  const title = `Run • ${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const items = run.items || [];
  const itemCount = items.length;

  const chips = items.slice(0, 3).map((it: any) => `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][it.dayOfWeek] ?? "?"} ${it.startTime}`);
  const more = items.length > 3 ? `+${items.length - 3}` : null;

  return (
    <button
      className={`saved-run-card ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="saved-run-title">{title}</div>
      <div className="saved-run-sub">{itemCount} courses • {run.explanation ? "with note" : "no note"}</div>
      <div className="saved-run-chips">
        {chips.map((c, i) => (
          <span key={i} className="chip">{c}</span>
        ))}
        {more && <span className="chip">{more}</span>}
      </div>
    </button>
  );
}
