import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import Builder from "./components/Builder";
import ImageUpload from "./components/ImageUpload";
import WeeklySchedule from "./components/WeeklySchedule";
import ProtectedRoute from "./components/ProtectedRoute";
import { timeToMinutes, minutesToTime } from "./components/ScheduleGrid";
import type { NavKey } from "./components/Sidebar";
import { usePlanner } from "./store/usePlanner";
import { usePreferences } from "./store/usePreferences";
import { type AuthUser } from "./store/useUser";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import { t } from "./i18n";

const API_BASE = "http://localhost:4000";
const NAV_TO_PATH: Record<NavKey, string> = {
  planner: "/planner",
  saved: "/saved",
  admin: "/admin",
  help: "/help",
  grades: "/grades",
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
};

const pathToNav = (path: string): NavKey => {
  if (path.startsWith("/saved")) return "saved";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/help")) return "help";
  if (path.startsWith("/grades")) return "grades";
  if (path.startsWith("/profile")) return "profile";
  if (path.startsWith("/settings")) return "settings";
  if (path.startsWith("/login")) return "login";
  if (path.startsWith("/register")) return "register";
  return "planner";
};

type SavedScheduleItem = {
  id?: string;
  courseName?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
};

type SavedSchedule = {
  id: string;
  explanation?: string | null;
  items: SavedScheduleItem[];
};

function SavedSchedulesPage({
  language,
  schedule,
  loading,
  error,
  onReload,
}: {
  language: "EN" | "TR";
  schedule: SavedSchedule | null;
  loading: boolean;
  error?: string | null;
  onReload: () => void;
}) {
  const hasSchedule = Boolean(schedule && schedule.items && schedule.items.length);
  const bounds = useMemo(() => {
    if (!schedule || !schedule.items?.length) return { startHour: 9, endHour: 18 };
    const starts = schedule.items
      .map((it) => timeToMinutes((it.startTime ?? "").slice(0, 5)))
      .filter((n) => Number.isFinite(n));
    const ends = schedule.items
      .map((it) => timeToMinutes((it.endTime ?? "").slice(0, 5)))
      .filter((n) => Number.isFinite(n));
    if (!starts.length || !ends.length) return { startHour: 9, endHour: 18 };
    const floorToStep = (n: number, step = 30) => Math.floor(n / step) * step;
    const ceilToStep = (n: number, step = 30) => Math.ceil(n / step) * step;
    const earliest = floorToStep(Math.min(...starts));
    const latest = ceilToStep(Math.max(...ends));
    const startHour = Math.max(0, Math.floor(earliest / 60));
    const endHour = Math.max(startHour + 1, Math.ceil(latest / 60));
    return { startHour, endHour };
  }, [schedule]);

  const blocks = useMemo(() => {
    if (!schedule) return [];
    const days: ("MON" | "TUE" | "WED" | "THU" | "FRI")[] = ["MON", "TUE", "WED", "THU", "FRI"];
    const accents: Array<"purple" | "orange" | "blue" | "pink"> = ["purple", "orange", "blue", "pink"];
    return schedule.items
      .map((it, idx) => {
        const dayIdx = Math.max(0, Math.min(4, (Number(it.dayOfWeek ?? 1) - 1) % 7));
        const start = (it.startTime ?? "").slice(0, 5);
        const end = (it.endTime ?? "").slice(0, 5);
        if (!start || !end) return null;
        return {
          id: it.id ?? `${it.courseName ?? "course"}-${idx}`,
          day: days[dayIdx],
          start,
          end,
          code: it.courseName ?? "Course",
          subtitle: it.room ?? undefined,
          accent: accents[idx % accents.length],
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        day: "MON" | "TUE" | "WED" | "THU" | "FRI";
        start: string;
        end: string;
        code: string;
        subtitle?: string;
        accent: "purple" | "orange" | "blue" | "pink";
      }>;
  }, [schedule]);

  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "page.savedTitle")}</h1>
          <p className="planner-subtitle">
            Your generated schedules will appear here when saving is enabled.
          </p>
        </div>
        <span className="planner-badge">v1.0 - Student project</span>
      </header>

      <section className="panel-card panel-wide">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Saved schedule</h2>
            <p className="panel-subtitle">Latest saved result from the planner.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="primary-btn" onClick={onReload} disabled={loading}>
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>

        <div className="panel-body">
          {loading && <div className="muted">Loading saved schedule...</div>}
          {!loading && error && (
            <div style={{ color: "#fca5a5", marginBottom: 8, fontSize: "13px" }}>{error}</div>
          )}
          {!loading && !error && !hasSchedule && (
            <div className="muted">No saved schedules yet. Save a schedule from the planner.</div>
          )}

          {!loading && !error && hasSchedule && (
            <>
              <WeeklySchedule
                blocks={blocks}
                startHour={bounds.startHour}
                endHour={bounds.endHour}
              />

              <div className="slots-table-wrapper" style={{ marginTop: 16 }}>
                <table className="slots-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Day</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule?.items?.map((it, idx) => (
                      <tr key={it.id ?? idx}>
                        <td><strong>{it.courseName ?? "Course"}</strong></td>
                        <td>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(it.dayOfWeek ?? 1) - 1] || "Mon"}</td>
                        <td>{(it.startTime ?? "").slice(0, 5)}</td>
                        <td>{(it.endTime ?? "").slice(0, 5)}</td>
                        <td className="muted">{it.room || "Room TBD"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function AdminPanelPage({ language }: { language: "EN" | "TR" }) {
  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "page.adminTitle")}</h1>
          <p className="planner-subtitle">
            Manage data sources, permissions and solver settings.
          </p>
        </div>
        <span className="planner-badge">v1.0 - Student project</span>
      </header>

      <section className="panel-card panel-wide">
        <div className="panel-body">
          <p className="muted">
            Admin tools are not wired yet. Add controls here when backend
            endpoints are ready.
          </p>
        </div>
      </section>
    </main>
  );
}

function HelpPage({ language }: { language: "EN" | "TR" }) {
  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "page.helpTitle")}</h1>
          <p className="planner-subtitle">Quick info and usage notes.</p>
        </div>
        <span className="planner-badge">v1.0 - Student project</span>
      </header>

      <section className="panel-card panel-wide">
        <div className="panel-body">
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <h3 className="panel-title" style={{ marginBottom: "4px" }}>
                About
              </h3>
              <p className="muted">
                AI Academic Planner helps build weekly schedules and calculate grades.
              </p>
            </div>

            <div>
              <h3 className="panel-title" style={{ marginBottom: "4px" }}>
                How to Use
              </h3>
              <p className="muted">
                Add courses and slots in Planner, then click Generate Schedule to see the grid and explanation.
              </p>
            </div>

            <div>
              <h3 className="panel-title" style={{ marginBottom: "4px" }}>
                Notes Calculator
              </h3>
              <p className="muted">
                Use Grade calculator to add components, weights and scores. Keep total weight at 100%.
              </p>
            </div>

            <div>
              <h3 className="panel-title" style={{ marginBottom: "4px" }}>
                Disclaimer
              </h3>
              <p className="muted">
                Outputs are suggestions only. Verify with official course policies.
              </p>
            </div>

            <div>
              <h3 className="panel-title" style={{ marginBottom: "4px" }}>
                Version
              </h3>
              <p className="muted">v1.0 - Student project</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfilePage({ user, language }: { user: AuthUser | null; language: "EN" | "TR" }) {
  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "page.profileTitle")}</h1>
          <p className="planner-subtitle">User snapshot</p>
        </div>
        <span className="planner-badge">v1.0 - Student project</span>
      </header>

      <section className="panel-card panel-wide">
        <div className="panel-body">
          {user ? (
            <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
              <div>
                <strong>Name:</strong> {user.name}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>School:</strong> {user.school ?? "N/A"}
              </div>
              <div>
                <strong>Department:</strong> {user.department ?? "N/A"}
              </div>
            </div>
          ) : (
            <div className="muted">No profile loaded. Please sign in.</div>
          )}
        </div>
      </section>
    </main>
  );
}

function AccountSettingsPage({ language }: { language: "EN" | "TR" }) {
  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "page.settingsTitle")}</h1>
          <p className="planner-subtitle">
            Placeholder account settings. Wire to backend when ready.
          </p>
        </div>
        <span className="planner-badge">v1.0 - Student project</span>
      </header>

      <section className="panel-card panel-wide">
        <div className="panel-body">
          <p className="muted">
            Settings are not connected yet. Add real controls when backend endpoints
            exist.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const placed = usePlanner((s) => s.placed);
  const reasoning = usePlanner((s) => s.reasoning);
  const loading = usePlanner((s) => s.loading);
  const error = usePlanner((s) => s.error);
  const solveNow = usePlanner((s) => s.solveNow);
  const resetPlanner = usePlanner((s) => s.reset);
  const language = usePreferences((s) => s.language);
  const authUser = useAuth((s) => s.user ?? null);
  const authLoading = useAuth((s) => s.loading);
  const loadMe = useAuth((s) => s.loadMe);

  const [page, setPage] = useState<NavKey>(() => pathToNav(window.location.pathname || "/planner"));
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(() => {
    const st = window.history.state as any;
    return st?.selectedId ?? null;
  });
  const [savedSchedule, setSavedSchedule] = useState<SavedSchedule | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const lastUserIdRef = useRef<string | null>(null);

  // Reset planner and saved state whenever the authenticated user changes
  useEffect(() => {
    const currentId = authUser?.id ?? null;
    if (currentId !== lastUserIdRef.current) {
      resetPlanner();
      setSavedSchedule(null);
      setSavedError(null);
      setSelectedSavedId(null);
      setSaveStatus("idle");
      setSaveMessage("");
    }
    lastUserIdRef.current = currentId;
  }, [authUser, resetPlanner]);

  const handleNavigate = useCallback(
    (nav: NavKey, state?: { selectedId?: string | null }) => {
      const path = NAV_TO_PATH[nav] ?? "/planner";
      window.history.pushState(state ?? null, "", path);
      setPage(nav);
      setSelectedSavedId(state?.selectedId ?? null);
    },
    [],
  );

  useEffect(() => {
    const onPop = () => {
      const nav = pathToNav(window.location.pathname || "/planner");
      const st = window.history.state as any;
      setPage(nav);
      setSelectedSavedId(st?.selectedId ?? null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const fetchLatestScheduleId = useCallback(async (): Promise<string | null> => {
    const res = await fetch(`${API_BASE}/api/schedules`, { credentials: "include" });
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch schedules");
    }
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return null;
    return String(list[0].id);
  }, []);

  const fetchScheduleById = useCallback(async (id: string): Promise<SavedSchedule> => {
    const res = await fetch(`${API_BASE}/api/schedules/${id}`, { credentials: "include" });
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch saved schedule");
    }
    const data = await res.json();
    return {
      id: String(data.id),
      explanation: data.explanation ?? null,
      items: Array.isArray(data.items)
        ? data.items.map((it: any, idx: number): SavedScheduleItem => ({
            id: it.id ? String(it.id) : `${data.id}-${idx}`,
            courseName: it.courseName ?? it.courseCode ?? "Course",
            dayOfWeek: Number(it.dayOfWeek ?? 1),
            startTime: it.startTime,
            endTime: it.endTime,
            room: it.room ?? null,
          }))
        : [],
    };
  }, []);

  const loadSavedSchedule = useCallback(
    async (targetId?: string | null) => {
      setSavedLoading(true);
      setSavedError(null);
      try {
        const id = targetId || (await fetchLatestScheduleId());
        if (!id) {
          setSavedSchedule(null);
          setSavedError(null);
          setSelectedSavedId(null);
          return;
        }
        const schedule = await fetchScheduleById(id);
        setSavedSchedule(schedule);
        setSelectedSavedId(id);
      } catch (err: any) {
        setSavedSchedule(null);
        const message = err?.message || "Failed to load saved schedule";
        setSavedError(message);
        if (message === "Unauthorized") {
          handleNavigate("login");
        }
      } finally {
        setSavedLoading(false);
      }
    },
    [fetchLatestScheduleId, fetchScheduleById, handleNavigate],
  );

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (page !== "saved" || !authUser) return;
    void loadSavedSchedule(selectedSavedId);
  }, [page, selectedSavedId, loadSavedSchedule, authUser]);

  useEffect(() => {
    if (saveStatus === "idle") return;
    setSaveStatus("idle");
    setSaveMessage("");
  }, [placed, saveStatus]);

  async function handleGenerateSchedule() {
    await solveNow();
  }

  async function handleSaveSchedule() {
    if (!placed.length || saveStatus === "saving") return;
    setSaveStatus("saving");
    setSaveMessage("Saving...");
    try {
      const payload = {
        items: placed.map((p) => ({
          courseName: p.courseName,
          dayOfWeek: p.dayOfWeek,
          startTime: p.start,
          endTime: p.end,
          room: p.room ?? null,
        })),
        explanation: reasoning ?? null,
      };

      const res = await fetch(`${API_BASE}/api/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save schedule");
      }

      const data = await res.json().catch(() => ({}));
      const createdId =
        data?.id ??
        data?.scheduleId ??
        data?.savedScheduleId ??
        data?.data?.id ??
        null;
      if (!createdId) {
        throw new Error("Missing schedule id from response");
      }

      setSaveStatus("saved");
      setSaveMessage("Saved");
      setSelectedSavedId(String(createdId));

      setTimeout(() => {
        handleNavigate("saved", { selectedId: String(createdId) });
      }, 400);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(err?.message || "Failed to save");
    }
  }

  type GradeRow = {
    id: string;
    name: string;
    score: string;
    weight: string;
  };

  const [gradeRows, setGradeRows] = useState<GradeRow[]>([
    { id: "g1", name: "Midterm", score: "", weight: "30" },
    { id: "g2", name: "Final", score: "", weight: "40" },
    { id: "g3", name: "Lab", score: "", weight: "30" },
  ]);
  const [passing, setPassing] = useState<string>("60");
  const [calcResult, setCalcResult] = useState<{
    totalWeight: number;
    average: number;
    pass: boolean;
    requiredMessage?: string;
  } | null>(null);

  function addGradeRow() {
    setGradeRows((rows) => [
      ...rows,
      { id: `g_${Date.now()}`, name: "", score: "", weight: "" },
    ]);
  }

  function updateGradeRow(id: string, field: keyof GradeRow, value: string) {
    setGradeRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  function removeGradeRow(id: string) {
    setGradeRows((rows) => rows.filter((r) => r.id !== id));
  }

  const weights = useMemo(
    () =>
      gradeRows.map((r) => ({
        id: r.id,
        name: r.name.trim(),
        score: r.score.trim() === "" ? NaN : Number(r.score),
        weight: r.weight.trim() === "" ? NaN : Number(r.weight),
      })),
    [gradeRows],
  );

  function calculateGrades() {
    const totalWeight = weights.reduce(
      (sum, r) => sum + (Number.isFinite(r.weight) ? r.weight : 0),
      0,
    );
    const known = weights.filter(
      (r) => Number.isFinite(r.weight) && Number.isFinite(r.score),
    );
    const knownContribution = known.reduce(
      (sum, r) => sum + (r.score * r.weight) / 100,
      0,
    );
    const remainingWeight = weights.reduce(
      (sum, r) => sum + (Number.isFinite(r.weight) && !Number.isFinite(r.score) ? r.weight : 0),
      0,
    );
    const average = totalWeight > 0 ? knownContribution * (100 / totalWeight) : 0;

    const passTarget = Number(passing) || 0;
    let requiredMessage: string | undefined;
    let pass = average >= passTarget && totalWeight === 100;

    if (!pass && totalWeight === 100) {
      if (remainingWeight > 0) {
        const neededScore =
          (passTarget * 100 - knownContribution * 100) / remainingWeight;
        if (neededScore <= 0) {
          pass = true;
        } else if (neededScore <= 100) {
          requiredMessage = `You need at least ${neededScore.toFixed(
            1,
          )} on remaining ${remainingWeight}% weight to pass.`;
        } else {
          requiredMessage =
            "Even scoring 100 on remaining items will not reach the passing grade.";
        }
      } else {
        requiredMessage = "No remaining components left to improve the grade.";
      }
    }

    setCalcResult({ totalWeight, average, pass, requiredMessage });
  }

  const timeBounds = useMemo(() => {
    if (!placed.length) return { start: "08:00", end: "18:00" };
    const starts = placed
      .map((p) => timeToMinutes(p.start))
      .filter((n) => Number.isFinite(n));
    const ends = placed
      .map((p) => timeToMinutes(p.end))
      .filter((n) => Number.isFinite(n));
    if (!starts.length || !ends.length) return { start: "08:00", end: "18:00" };

    const floorToStep = (n: number, step = 30) => Math.floor(n / step) * step;
    const ceilToStep = (n: number, step = 30) => Math.ceil(n / step) * step;

    const earliest = floorToStep(Math.min(...starts));
    const latest = ceilToStep(Math.max(...ends));
    return {
      start: minutesToTime(earliest),
      end: minutesToTime(latest),
    };
  }, [placed]);

  const scheduleBlocks = useMemo(
    () =>
      placed.map((p, idx) => {
        const dayIndex = (p.dayOfWeek ?? 1) - 1;
        const dayNames: ("MON" | "TUE" | "WED" | "THU" | "FRI")[] = [
          "MON",
          "TUE",
          "WED",
          "THU",
          "FRI",
        ];
        const accentPalette: Array<"purple" | "orange" | "blue" | "pink"> = [
          "purple",
          "orange",
          "blue",
          "pink",
        ];
        return {
          id: `${p.courseName}-${p.start}-${p.end}-${idx}`,
          day: dayNames[dayIndex] ?? "MON",
          start: p.start,
          end: p.end,
          code: p.courseName,
          subtitle: p.room ?? undefined,
          accent: accentPalette[idx % accentPalette.length],
        };
      }),
    [placed],
  );

  const startHourForGrid = useMemo(() => {
    const startMinutes = timeToMinutes(timeBounds.start);
    if (!Number.isFinite(startMinutes)) return 9;
    return Math.floor(startMinutes / 60);
  }, [timeBounds.start]);

  const endHourForGrid = useMemo(() => {
    const endMinutes = timeToMinutes(timeBounds.end);
    if (!Number.isFinite(endMinutes)) return 18;
    return Math.max(Math.ceil(endMinutes / 60), startHourForGrid + 1);
  }, [startHourForGrid, timeBounds.end]);

  const content =
    page === "planner" ? (
      <ProtectedRoute
        isAuthenticated={Boolean(authUser)}
        loading={authLoading}
        onRedirect={() => handleNavigate("login")}
      >
        <main className="planner-main">
          <header className="planner-header">
            <div>
              <h1 className="planner-title">{t(language, "page.plannerTitle")}</h1>
              <p className="planner-subtitle">
                Build and generate your weekly schedule with AI.
              </p>
            </div>
            <span className="planner-badge">v1.0 - Student project</span>
          </header>

          <div className="planner-row-top">
            <section className="panel-card panel-primary">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Course &amp; Slot Builder</h2>
                  <p className="panel-subtitle">
                    Add your courses and possible time slots. The solver will pick
                    the best non-conflicting combination.
                  </p>
                </div>
              </div>

              <div className="panel-body">
                <Builder />
              </div>
            </section>

            <section className="panel-card panel-secondary">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Entered courses</h2>
                  <p className="panel-subtitle">
                    Preview of what you&apos;ve added and import from image.
                  </p>
                </div>
              </div>

              <div className="panel-body">
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "13px",
                    color: "var(--color-muted)",
                  }}
                >
                  You haven&apos;t added anything yet. Add courses and time slots
                  using the builder on the left, or read them from a photo below.
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "var(--color-panel-end)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <ImageUpload />
                </div>
              </div>
            </section>
          </div>

          <section className="panel-card panel-wide">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">AI Generated Schedule</h2>
                <p className="panel-subtitle">
                  Generated timetable will appear in this weekly grid.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: saveStatus === "error" ? "#fca5a5" : "#cbd5e1" }}>
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "saved" && "Saved"}
                  {saveStatus === "error" && saveMessage}
                  {saveStatus === "idle" && ""}
                </span>
                <button
                  onClick={handleSaveSchedule}
                  disabled={loading || placed.length === 0 || saveStatus === "saving"}
                  className="primary-btn"
                >
                  {saveStatus === "saving" ? "Saving..." : "Save schedule"}
                </button>
                <button
                  onClick={handleGenerateSchedule}
                  disabled={loading}
                  className="primary-btn"
                >
                  {loading ? "Calculating..." : t(language, "button.generateSchedule")}
                </button>
              </div>
            </div>

            <div className="panel-body">
              {placed.length === 0 && !loading && (
                <div className="muted" style={{ marginBottom: "8px" }}>
                  No schedule generated.
                </div>
              )}
              {placed.length > 0 ? (
                <WeeklySchedule
                  blocks={scheduleBlocks}
                  startHour={startHourForGrid}
                  endHour={endHourForGrid}
                />
              ) : (
                !loading &&
                !error && (
                  <p className="muted" style={{ marginTop: "10px" }}>
                    No schedule yet. Add some courses and click{" "}
                    <b>{t(language, "button.generateSchedule")}</b>.
                  </p>
                )
              )}
              {placed.length > 0 && (
                <div className="slots-table-wrapper" style={{ marginTop: 16 }}>
                  <table className="slots-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Day</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placed.map((it) => (
                        <tr key={`${it.courseName}-${it.dayOfWeek}-${it.start}-${it.end}`}>
                          <td><strong>{it.courseName}</strong></td>
                          <td>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(it.dayOfWeek ?? 1) - 1] || "Mon"}</td>
                          <td>{it.start}</td>
                          <td>{it.end}</td>
                          <td className="muted">{it.room || "Room TBD"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

        </main>
      </ProtectedRoute>
    ) : page === "grades" ? (
      <main className="planner-main">
        <header className="planner-header">
          <div>
            <h1 className="planner-title">{t(language, "page.gradesTitle")}</h1>
            <p className="planner-subtitle">
              Add grading components, weights and scores to see your status.
            </p>
          </div>
          <span className="planner-badge">v1.0 - Student project</span>
        </header>

        <section className="panel-card panel-wide">
          <div className="panel-header" style={{ alignItems: "center" }}>
            <div>
              <h2 className="panel-title">Components</h2>
              <p className="panel-subtitle">
                Weights should total 100%. Leave score empty for future items.
              </p>
            </div>
            <button className="primary-btn" onClick={addGradeRow}>
              Add component
            </button>
          </div>

          <div className="panel-body" style={{ display: "grid", gap: "10px" }}>
            <div
              className="panel-card"
              style={{
                background: "transparent",
                border: "1px solid var(--color-grid)",
                boxShadow: "none",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 0.6fr 0.6fr auto",
                  gap: "10px",
                  alignItems: "center",
                  fontSize: "13px",
                  marginBottom: "8px",
                  color: "var(--color-muted)",
                }}
              >
                <div>Name</div>
                <div>Score (0-100)</div>
                <div>Weight %</div>
                <div />
              </div>

              {gradeRows.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 0.6fr 0.6fr auto",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateGradeRow(row.id, "name", e.target.value)}
                    placeholder="e.g., Midterm"
                    className="builder-room"
                    style={{ marginTop: 0 }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.score}
                    onChange={(e) => updateGradeRow(row.id, "score", e.target.value)}
                    className="builder-room"
                    style={{ marginTop: 0 }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.weight}
                    onChange={(e) =>
                      updateGradeRow(row.id, "weight", e.target.value)
                    }
                    className="builder-room"
                    style={{ marginTop: 0 }}
                  />
                  <button
                    className="primary-btn"
                    style={{ padding: "8px 12px" }}
                    onClick={() => removeGradeRow(row.id)}
                    disabled={gradeRows.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div>
                <div className="panel-subtitle" style={{ marginBottom: "4px" }}>
                  Passing grade
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passing}
                  onChange={(e) => setPassing(e.target.value)}
                  className="builder-room"
                  style={{ marginTop: 0 }}
                />
              </div>
              <div>
                <button
                  className="primary-btn"
                  style={{ width: "100%", padding: "10px 12px" }}
                  onClick={calculateGrades}
                >
                  Calculate
                </button>
              </div>
            </div>

            {calcResult && (
              <div
                className="panel-card"
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-grid)",
                  boxShadow: "none",
                  padding: "12px",
                }}
              >
                <div style={{ marginBottom: "6px" }}>
                  <strong>Total weight:</strong> {calcResult.totalWeight.toFixed(1)}%
                  {calcResult.totalWeight !== 100 && (
                    <span style={{ color: "#fca5a5", marginLeft: "8px" }}>
                      Weights should sum to 100%.
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Final average:</strong> {calcResult.average.toFixed(2)}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: calcResult.pass ? "#22c55e" : "#f87171" }}>
                    {calcResult.pass ? "Pass" : "Fail"}
                  </span>
                </div>
                {!calcResult.pass && calcResult.requiredMessage && (
                  <div style={{ color: "#fca5a5" }}>{calcResult.requiredMessage}</div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    ) : page === "saved" ? (
      <ProtectedRoute
        isAuthenticated={Boolean(authUser)}
        loading={authLoading}
        onRedirect={() => handleNavigate("login")}
      >
        <SavedSchedulesPage
          language={language}
          schedule={savedSchedule}
          loading={savedLoading}
          error={savedError}
          onReload={() => loadSavedSchedule(selectedSavedId)}
        />
      </ProtectedRoute>
    ) : page === "admin" ? (
      <AdminPanelPage language={language} />
    ) : page === "profile" ? (
      <ProfilePage language={language} user={authUser} />
    ) : page === "settings" ? (
      <AccountSettingsPage language={language} />
    ) : page === "login" ? (
      <LoginPage
        onLogin={() => handleNavigate("planner")}
        onSwitchToRegister={() => handleNavigate("register")}
      />
    ) : page === "register" ? (
      <RegisterPage
        onRegister={() => handleNavigate("planner")}
        onSwitchToLogin={() => handleNavigate("login")}
      />
    ) : (
      <HelpPage language={language} />
    );

  return (
    <Layout activePage={page} onNavigate={handleNavigate}>
      {content}
    </Layout>
  );
}
