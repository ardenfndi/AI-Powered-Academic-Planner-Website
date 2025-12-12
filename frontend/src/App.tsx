import { useMemo, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import Builder from "./components/Builder";
import ImageUpload from "./components/ImageUpload";
import type { NavKey } from "./components/Sidebar";
import { usePlanner } from "./store/usePlanner";
import { useUser, type User } from "./store/useUser";
import { t } from "./i18n";

function SavedSchedulesPage({ language }: { language: "EN" | "TR" }) {
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
        <div className="panel-body">
          <p className="muted">
            No saved schedules yet. Generate a schedule in Planner and save it
            to see it listed here.
          </p>
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

function ProfilePage({
  user,
  language,
}: {
  user: User;
  language: "EN" | "TR";
}) {
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
          <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
          </div>
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
  const user = useUser((s) => s.user);
  const language = user.language;

  const [page, setPage] = useState<NavKey>("planner");

  async function handleGenerateSchedule() {
    await solveNow();
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

  const content =
    page === "planner" ? (
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

            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Calculating..." : t(language, "button.generateSchedule")}
            </button>
          </div>

          <div className="panel-body">
            <div className="schedule-grid">
              <div className="schedule-header-row">
                <div className="schedule-time-col" />
                <div className="schedule-day-col">Mon</div>
                <div className="schedule-day-col">Tue</div>
                <div className="schedule-day-col">Wed</div>
                <div className="schedule-day-col">Thu</div>
                <div className="schedule-day-col">Fri</div>
              </div>

              {["08 AM", "10 AM", "12 PM", "2 PM", "4 PM"].map((time) => (
                <div className="schedule-row" key={time}>
                  <div className="schedule-time-col">{time}</div>
                  <div className="schedule-cell" />
                  <div className="schedule-cell" />
                  <div className="schedule-cell" />
                  <div className="schedule-cell" />
                  <div className="schedule-cell" />
                </div>
              ))}
            </div>

            {!loading && placed.length === 0 && !error && (
              <p className="muted" style={{ marginTop: "10px" }}>
                No schedule yet. Add some courses and click{" "}
                <b>{t(language, "button.generateSchedule")}</b>.
              </p>
            )}
          </div>
        </section>

        <section className="panel-card panel-wide">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">AI Explanation</h2>
              <p className="panel-subtitle">
                Reasoning, conflicts and trade-offs for the chosen schedule.
              </p>
            </div>
          </div>

          <div className="panel-body">
            {error && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--color-danger-bg)",
                  color: "var(--color-danger-text)",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {reasoning && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "12px 12px 8px",
                  borderRadius: "12px",
                  background: "var(--color-panel-end)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "13px",
                }}
              >
                <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                  AI Explanation
                </div>
                <p
                  style={{
                    marginBottom: "4px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {reasoning}
                </p>
              </div>
            )}

            {!reasoning && placed.length === 0 && !error && !loading && (
              <p className="muted">
                After adding courses and slots and clicking{" "}
                <b>{t(language, "button.generateSchedule")}</b>, the solver&apos;s
                explanation will be shown here.
              </p>
            )}
          </div>
        </section>
      </main>
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
      <SavedSchedulesPage language={language} />
    ) : page === "admin" ? (
      <AdminPanelPage language={language} />
    ) : page === "profile" ? (
      <ProfilePage language={language} user={user} />
    ) : page === "settings" ? (
      <AccountSettingsPage language={language} />
    ) : (
      <HelpPage language={language} />
    );

  return (
    <Layout activePage={page} onNavigate={setPage}>
      {content}
    </Layout>
  );
}
