import "./PlannerMain.css";

export default function PlannerMain() {
  return (
    <main className="planner-main">
      {/* Üst başlık */}
      <header className="planner-header">
        <div>
          <h1 className="planner-title">Planner</h1>
          <p className="planner-subtitle">
            Build and generate your weekly schedule with AI.
          </p>
        </div>
        <span className="planner-badge">v1.0 • Student project</span>
      </header>

      {/* Üst satır: Course builder + (ileride) saved schedules */}
      <div className="planner-row-top">
        {/* Course & Slot Builder */}
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

          {/* BURAYA kendi formunu bağlayacağız */}
          <div className="panel-body form-row">
            <input
              className="input text-input"
              placeholder="Course name (e.g., CS302)"
            />

            <select className="input select-input">
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
            </select>

            <div className="time-group">
              <select className="input select-input">
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
              </select>
              <span className="time-separator">:</span>
              <select className="input select-input">
                <option>00</option>
                <option>30</option>
              </select>
              <span className="time-range-separator">to</span>
              <select className="input select-input">
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
              </select>
              <span className="time-separator">:</span>
              <select className="input select-input">
                <option>00</option>
                <option>30</option>
              </select>
            </div>

            <input
              className="input text-input room-input"
              placeholder="Room (optional)"
            />

            <button className="btn btn-primary">Add course slot</button>
          </div>
        </section>

        {/* Sağdaki küçük panel: Entered courses (şimdilik basit) */}
        <section className="panel-card panel-secondary">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Entered courses</h2>
              <p className="panel-subtitle">
                Preview of the slots you&apos;ve added.
              </p>
            </div>
          </div>

          <div className="panel-body empty-state">
            <p>You haven&apos;t added anything yet.</p>
            <p className="muted">
              Add at least one course &amp; time slot on the left.
            </p>
          </div>
        </section>
      </div>

      {/* Orta kart: AI Generated Schedule (grid görünüm) */}
      <section className="panel-card panel-wide">
        <div className="panel-header">
          <h2 className="panel-title">AI Generated Schedule</h2>
          <p className="panel-subtitle">
            When you generate a schedule, it will appear in this weekly grid.
          </p>
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
        </div>
      </section>

      {/* Alt kart: AI Explanation */}
      <section className="panel-card panel-wide">
        <div className="panel-header">
          <h2 className="panel-title">AI Explanation</h2>
          <p className="panel-subtitle">
            The solver&apos;s reasoning and trade-offs will be explained here.
          </p>
        </div>

        <div className="panel-body">
          <p className="muted">
            After running the solver, a natural-language explanation of why this
            schedule was chosen will appear in this panel.
          </p>
        </div>
      </section>
    </main>
  );
}
