import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoals } from "../hooks/useGoals";
import PageWrapper from "../components/layout/PageWrapper";

const Dashboard = () => {
  const { user } = useAuth();
  const { goals, loading, createGoal, deleteGoal } = useGoals();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Achiever";
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const totalTasksDone = goals.reduce(
    (acc, g) => acc + (g.tasks?.filter((t) => t.is_complete).length || 0),
    0,
  );
  const totalHours = Math.round(
    goals.reduce(
      (acc, g) =>
        acc + (g.tasks?.reduce((a, t) => a + (t.total_minutes || 0), 0) || 0),
      0,
    ) / 60,
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDayOfWeek = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Goal title is required");
    setCreating(true);
    const { error } = await createGoal(form.title, form.description);
    setCreating(false);
    if (error) return setError(error.message);
    setForm({ title: "", description: "" });
    setShowForm(false);
    setError("");
  };

  return (
    <PageWrapper>
      <style>{`
        .db-page { padding-bottom: 4rem; }

        /* Hero */
        .db-hero { margin-bottom: 2rem; }
        .db-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #13132a; border: 1px solid #ffffff12;
          border-radius: 99px; padding: 0.3rem 0.9rem;
          font-size: 0.72rem; color: #6060a0;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 0.9rem;
        }
        .db-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #d4f244; box-shadow: 0 0 6px #d4f244;
          display: inline-block; animation: blink 2s ease-in-out infinite;
        }
        .db-greeting {
          font-family: var(--font-head);
          font-size: clamp(1.6rem, 5vw, 2.8rem);
          font-weight: 800; line-height: 1.15;
          color: #eeeef5; margin-bottom: 0.5rem;
        }
        .db-greeting span { color: #d4f244; }
        .db-sub { font-size: 0.9rem; color: #6060a0; line-height: 1.6; max-width: 480px; }

        /* Stats grid */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .db-stat {
          background: #13132a;
          border: 1px solid #ffffff12;
          border-radius: 16px;
          padding: 1.1rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s;
          cursor: default;
        }
        .db-stat:hover { transform: translateY(-3px); }
        .db-stat-icon { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .db-stat-value {
          font-family: var(--font-head);
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 800; line-height: 1;
          margin-bottom: 0.25rem;
        }
        .db-stat-label { font-size: 0.75rem; color: #6060a0; font-weight: 500; }
        .db-stat-glow {
          position: absolute; inset: 0; pointer-events: none;
          border-radius: 16px;
        }

        /* Section header */
        .db-section-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem; gap: 0.8rem;
          flex-wrap: wrap;
        }
        .db-section-title {
          font-family: var(--font-head);
          font-size: clamp(1rem, 3vw, 1.2rem);
          font-weight: 700; color: #eeeef5;
        }
        .db-new-btn {
          background: #d4f244; color: #04040c;
          border: none; border-radius: 10px;
          padding: 0.55rem 1.1rem;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: transform 0.2s;
          font-family: var(--font-head);
          box-shadow: 0 4px 16px #d4f24430;
          white-space: nowrap;
        }
        .db-new-btn:hover { transform: translateY(-2px); }

        /* Form card */
        .db-form-card {
          background: #13132a;
          border: 1px solid #d4f24430;
          border-radius: 16px;
          padding: clamp(1.2rem, 4vw, 1.8rem);
          margin-bottom: 1.5rem;
        }
        .db-form-title {
          font-family: var(--font-head);
          font-size: 1rem; font-weight: 700;
          color: #eeeef5; margin-bottom: 0.2rem;
        }
        .db-form-hint { font-size: 0.82rem; color: #6060a0; margin-bottom: 1rem; }
        .db-error {
          background: #ff4d6d18; border: 1px solid #ff4d6d40;
          color: #ff8099; border-radius: 8px;
          padding: 0.6rem 0.9rem; font-size: 0.82rem;
          margin-bottom: 0.9rem;
        }
        .db-field { margin-bottom: 0.9rem; }
        .db-label {
          display: block; font-size: 0.74rem; font-weight: 700;
          color: #6060a0; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 0.35rem;
        }
        .db-input {
          width: 100%; background: #0e0e20;
          border: 1px solid #ffffff12; border-radius: 8px;
          padding: 0.7rem 0.9rem; color: #eeeef5;
          font-size: 0.9rem; outline: none;
          transition: border-color 0.2s;
          font-family: var(--font-body);
        }
        .db-input:focus { border-color: #d4f244; }
        .db-submit {
          width: 100%; background: #d4f244; color: #04040c;
          border: none; border-radius: 10px; padding: 0.85rem;
          font-size: 0.92rem; font-weight: 700; cursor: pointer;
          transition: transform 0.2s; font-family: var(--font-head);
          margin-top: 0.3rem;
        }
        .db-submit:hover { transform: translateY(-2px); }
        .db-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Empty state */
        .db-empty {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 3rem 1rem; gap: 0.6rem;
        }
        .db-empty-icon { font-size: 2.8rem; margin-bottom: 0.4rem; }
        .db-empty-title {
          font-family: var(--font-head);
          font-size: 1.2rem; font-weight: 700; color: #eeeef5;
        }
        .db-empty-sub { font-size: 0.88rem; color: #6060a0; line-height: 1.6; }
        .db-empty-btn {
          margin-top: 0.8rem; background: #d4f244; color: #04040c;
          border: none; border-radius: 10px;
          padding: 0.7rem 1.6rem; font-size: 0.9rem;
          font-weight: 700; cursor: pointer;
          font-family: var(--font-head);
        }

        /* Goal cards */
        .db-goals { display: flex; flex-direction: column; gap: 1rem; }
        .db-goal-card {
          background: #13132a;
          border: 1px solid #ffffff12;
          border-radius: 16px;
          padding: clamp(1.1rem, 4vw, 1.6rem);
          transition: border-color 0.2s;
        }
        .db-goal-card:hover { border-color: #d4f24428; }
        .db-goal-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .db-goal-left { flex: 1; min-width: 0; }
        .db-status-badge {
          display: inline-block; font-size: 0.68rem;
          font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; border: 1px solid;
          border-radius: 99px; padding: 0.18rem 0.65rem;
          margin-bottom: 0.5rem;
        }
        .db-goal-title {
          font-family: var(--font-head);
          font-size: clamp(0.95rem, 3vw, 1.1rem);
          font-weight: 700; color: #eeeef5;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }
        .db-goal-desc {
          font-size: 0.82rem; color: #6060a0;
          line-height: 1.5; word-break: break-word;
        }
        .db-delete-btn {
          background: transparent; border: none;
          color: #6060a0; font-size: 0.9rem;
          cursor: pointer; padding: 0.3rem 0.5rem;
          border-radius: 6px; transition: all 0.2s;
          flex-shrink: 0;
        }
        .db-delete-btn:hover { background: #ff4d6d22; color: #ff4d6d; }

        /* Progress */
        .db-progress-meta {
          display: flex; justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .db-progress-label { font-size: 0.76rem; color: #6060a0; }
        .db-progress-pct { font-size: 0.76rem; font-weight: 700; }
        .db-track {
          height: 5px; background: #0e0e20;
          border-radius: 99px; overflow: hidden;
          margin-bottom: 0.35rem;
        }
        .db-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.6s cubic-bezier(.22,.68,0,1.2);
        }
        .db-task-meta { font-size: 0.74rem; color: #6060a0; }

        /* Card footer */
        .db-card-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 0.9rem;
          margin-top: 0.9rem;
          border-top: 1px solid #ffffff08;
          flex-wrap: wrap; gap: 0.6rem;
        }
        .db-dates { font-size: 0.74rem; color: #6060a0; }
        .db-manage-btn {
          background: transparent;
          border: 1px solid #d4f244;
          color: #d4f244; border-radius: 8px;
          padding: 0.38rem 0.9rem;
          font-size: 0.78rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: var(--font-head);
          white-space: nowrap;
        }
        .db-manage-btn:hover { background: #d4f244; color: #04040c; }

        /* Loading spinner */
        .db-spinner-wrap {
          display: flex; flex-direction: column;
          align-items: center; padding: 3rem 0; gap: 1rem;
        }
        .db-spinner {
          width: 32px; height: 32px;
          border: 3px solid #ffffff12;
          border-top: 3px solid #d4f244;
          border-radius: 50%;
          animation: spin-slow 0.8s linear infinite;
        }

        /* Tablet fixes */
        @media (max-width: 768px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
          .db-stat { padding: 1rem; }
        }

        /* Mobile fixes */
        @media (max-width: 480px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
          .db-stat { padding: 0.9rem 0.8rem; border-radius: 12px; }
          .db-stat-value { font-size: 1.4rem; }
          .db-stat-label { font-size: 0.7rem; }
          .db-goal-card { border-radius: 14px; }
          .db-card-footer { flex-direction: column; align-items: flex-start; }
          .db-manage-btn { width: 100%; text-align: center; justify-content: center; }
          .db-section-header { flex-direction: row; }
          .db-greeting { font-size: 1.5rem; }
        }
      `}</style>

      <div className="db-page animate-fadeUp">
        {/* Hero greeting */}
        <div className="db-hero">
          <div className="db-badge">
            <span className="db-badge-dot" />
            {getDayOfWeek()} · Week in progress
          </div>
          <h1 className="db-greeting">
            {getGreeting()},<br />
            <span>{firstName}.</span>
          </h1>
          <p className="db-sub">
            {activeGoals.length === 0
              ? "No active goals yet. What will you build this week?"
              : `${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""} in motion. Keep pushing.`}
          </p>
        </div>

        {/* Stats */}
        <div className="db-stats animate-fadeUp delay-1">
          <div className="db-stat" style={{ borderColor: "#d4f24420" }}>
            <div
              className="db-stat-glow"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, #d4f24412, transparent 70%)",
              }}
            />
            <div className="db-stat-icon">🎯</div>
            <div className="db-stat-value" style={{ color: "#d4f244" }}>
              {activeGoals.length}
            </div>
            <div className="db-stat-label">Active goals</div>
          </div>
          <div className="db-stat" style={{ borderColor: "#00f0d420" }}>
            <div
              className="db-stat-glow"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, #00f0d412, transparent 70%)",
              }}
            />
            <div className="db-stat-icon">✅</div>
            <div className="db-stat-value" style={{ color: "#00f0d4" }}>
              {completedGoals.length}
            </div>
            <div className="db-stat-label">Completed</div>
          </div>
          <div className="db-stat" style={{ borderColor: "#a78bfa20" }}>
            <div
              className="db-stat-glow"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, #a78bfa12, transparent 70%)",
              }}
            />
            <div className="db-stat-icon">⚡</div>
            <div className="db-stat-value" style={{ color: "#a78bfa" }}>
              {totalTasksDone}
            </div>
            <div className="db-stat-label">Tasks done</div>
          </div>
          <div className="db-stat" style={{ borderColor: "#f472b620" }}>
            <div
              className="db-stat-glow"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, #f472b612, transparent 70%)",
              }}
            />
            <div className="db-stat-icon">⏱</div>
            <div className="db-stat-value" style={{ color: "#f472b6" }}>
              {totalHours}h
            </div>
            <div className="db-stat-label">Hours tracked</div>
          </div>
        </div>

        {/* Section header */}
        <div className="db-section-header animate-fadeUp delay-2">
          <h2 className="db-section-title">This week's goals</h2>
          <button className="db-new-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ New goal"}
          </button>
        </div>

        {/* Create goal form */}
        {showForm && (
          <div className="db-form-card animate-fadeUp">
            <h3 className="db-form-title">Set your weekly goal</h3>
            <p className="db-form-hint">
              Be specific. What will you ship by Sunday?
            </p>
            {error && <div className="db-error">⚠ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="db-field">
                <label className="db-label">Goal title</label>
                <input
                  className="db-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Launch my portfolio website"
                />
              </div>
              <div className="db-field">
                <label className="db-label">
                  Why does this matter? (optional)
                </label>
                <textarea
                  className="db-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Your motivation..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <button type="submit" className="db-submit" disabled={creating}>
                {creating ? "●●●" : "Lock in this goal →"}
              </button>
            </form>
          </div>
        )}

        {/* Goals list */}
        {loading ? (
          <div className="db-spinner-wrap">
            <div className="db-spinner" />
            <p style={{ color: "#6060a0", fontSize: "0.88rem" }}>
              Loading your goals...
            </p>
          </div>
        ) : goals.length === 0 ? (
          <div className="db-empty animate-fadeUp delay-3">
            <div className="db-empty-icon">🚀</div>
            <h3 className="db-empty-title">No goals yet</h3>
            <p className="db-empty-sub">
              Every great achievement starts with a decision.
              <br />
              Set your first goal for this week.
            </p>
            <button className="db-empty-btn" onClick={() => setShowForm(true)}>
              Set my first goal
            </button>
          </div>
        ) : (
          <div className="db-goals">
            {goals.map((goal, i) => {
              const tasks = goal.tasks || [];
              const done = tasks.filter((t) => t.is_complete).length;
              const pct = goal.progress_pct || 0;
              const statusColor =
                {
                  active: "#d4f244",
                  completed: "#00f0d4",
                  rolled_over: "#f472b6",
                }[goal.status] || "#6060a0";

              return (
                <div
                  key={goal.id}
                  className={`db-goal-card animate-fadeUp delay-${Math.min(i + 2, 5)}`}
                >
                  <div className="db-goal-top">
                    <div className="db-goal-left">
                      <div
                        className="db-status-badge"
                        style={{
                          color: statusColor,
                          borderColor: statusColor + "40",
                          backgroundColor: statusColor + "12",
                        }}
                      >
                        {goal.status === "completed"
                          ? "✓ Completed"
                          : goal.status === "rolled_over"
                            ? "↻ Rolled over"
                            : "● Active"}
                      </div>
                      <h3 className="db-goal-title">{goal.title}</h3>
                      {goal.description && (
                        <p className="db-goal-desc">{goal.description}</p>
                      )}
                    </div>
                    <button
                      className="db-delete-btn"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="db-progress-meta">
                    <span className="db-progress-label">Progress</span>
                    <span
                      className="db-progress-pct"
                      style={{ color: pct === 100 ? "#00f0d4" : "#d4f244" }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="db-track">
                    <div
                      className="db-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#00f0d4" : "#d4f244",
                      }}
                    />
                  </div>
                  <div className="db-task-meta">
                    {tasks.length > 0
                      ? `${done} of ${tasks.length} tasks complete`
                      : "No tasks added yet"}
                  </div>

                  {/* Footer */}
                  <div className="db-card-footer">
                    <span className="db-dates">
                      📅 {goal.week_start} → {goal.week_end}
                    </span>
                    <button
                      className="db-manage-btn"
                      onClick={() => navigate("/goals")}
                    >
                      Manage tasks →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
