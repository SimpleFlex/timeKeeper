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
      {/* Hero greeting */}
      <div style={s.hero} className="animate-fadeUp">
        <div style={s.heroBadge}>
          <span style={s.heroDot} />
          {getDayOfWeek()} · Week in progress
        </div>
        <h1 style={s.heroTitle}>
          {getGreeting()},<br />
          <span style={s.heroName}>{firstName}.</span>
        </h1>
        <p style={s.heroSub}>
          {activeGoals.length === 0
            ? "You haven't set a goal yet this week. What will you build?"
            : `You have ${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""} in motion. Keep pushing.`}
        </p>
      </div>

      {/* Stats row */}
      <div style={s.statsRow} className="animate-fadeUp delay-2">
        <StatCard
          label="Active goals"
          value={activeGoals.length}
          accent="var(--lime)"
          icon="🎯"
        />
        <StatCard
          label="Completed"
          value={completedGoals.length}
          accent="var(--cyan)"
          icon="✅"
        />
        <StatCard
          label="Tasks done"
          value={goals.reduce(
            (acc, g) =>
              acc + (g.tasks?.filter((t) => t.is_complete).length || 0),
            0,
          )}
          accent="#a78bfa"
          icon="⚡"
        />
        <StatCard
          label="Hours tracked"
          value={`${Math.round(goals.reduce((acc, g) => acc + (g.tasks?.reduce((a, t) => a + (t.total_minutes || 0), 0) || 0), 0) / 60)}h`}
          accent="#f472b6"
          icon="⏱"
        />
      </div>

      {/* Goals section header */}
      <div style={s.sectionHeader} className="animate-fadeUp delay-3">
        <h2 style={s.sectionTitle}>This week's goals</h2>
        <button
          style={s.newGoalBtn}
          onClick={() => setShowForm(!showForm)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          {showForm ? "✕ Cancel" : "+ New goal"}
        </button>
      </div>

      {/* Create goal form */}
      {showForm && (
        <div style={s.formCard} className="animate-fadeUp">
          <h3 style={s.formTitle}>Set your weekly goal</h3>
          <p style={s.formHint}>
            Be specific. What will you have built or achieved by Sunday?
          </p>
          {error && <div style={s.errorBox}>⚠ {error}</div>}
          <form onSubmit={handleCreate}>
            <div style={s.field}>
              <label style={s.label}>Goal title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Launch my portfolio website"
                style={s.input}
                onFocus={(e) => (e.target.style.borderColor = "var(--lime)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Why does this matter? (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Write your motivation here..."
                rows={3}
                style={{ ...s.input, resize: "vertical" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--lime)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              style={s.submitBtn}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {creating ? "●●●" : "Lock in this goal →"}
            </button>
          </form>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div style={s.emptyState}>
          <div style={s.loadingSpinner} />
          <p style={{ color: "var(--muted)" }}>Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div style={s.emptyState} className="animate-fadeUp delay-4">
          <div style={s.emptyIcon}>🚀</div>
          <h3 style={s.emptyTitle}>No goals yet</h3>
          <p style={s.emptyText}>
            Every great achievement starts with a decision.
            <br />
            Set your first goal for this week.
          </p>
          <button style={s.emptyBtn} onClick={() => setShowForm(true)}>
            Set my first goal
          </button>
        </div>
      ) : (
        <div style={s.goalsList}>
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onDelete={deleteGoal}
              onNavigate={() => navigate("/goals")}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

const StatCard = ({ label, value, accent, icon }) => (
  <div
    style={{ ...ss.statCard }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ ...ss.statIcon, color: accent }}>{icon}</div>
    <div style={{ ...ss.statValue, color: accent }}>{value}</div>
    <div style={ss.statLabel}>{label}</div>
    <div
      style={{
        ...ss.statGlow,
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
      }}
    />
  </div>
);

const GoalCard = ({ goal, index, onDelete, onNavigate }) => {
  const tasks = goal.tasks || [];
  const done = tasks.filter((t) => t.is_complete).length;
  const pct = goal.progress_pct || 0;

  const statusColor =
    {
      active: "var(--lime)",
      completed: "var(--cyan)",
      rolled_over: "#f472b6",
    }[goal.status] || "var(--muted)";

  return (
    <div
      style={gc.card}
      className={`animate-fadeUp delay-${Math.min(index + 3, 5)}`}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--lime)30")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div style={gc.top}>
        <div style={gc.left}>
          <div
            style={{
              ...gc.statusBadge,
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
          <h3 style={gc.title}>{goal.title}</h3>
          {goal.description && <p style={gc.desc}>{goal.description}</p>}
        </div>
        <button
          style={gc.deleteBtn}
          onClick={() => onDelete(goal.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ff4d6d22";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div style={gc.progressSection}>
        <div style={gc.progressMeta}>
          <span style={gc.progressLabel}>Progress</span>
          <span
            style={{
              ...gc.progressPct,
              color: pct === 100 ? "var(--cyan)" : "var(--lime)",
            }}
          >
            {pct}%
          </span>
        </div>
        <div style={gc.track}>
          <div
            style={{
              ...gc.fill,
              width: `${pct}%`,
              backgroundColor: pct === 100 ? "var(--cyan)" : "var(--lime)",
            }}
          />
        </div>
        <div style={gc.taskMeta}>
          {tasks.length > 0
            ? `${done} of ${tasks.length} tasks complete`
            : "No tasks added yet"}
        </div>
      </div>

      {/* Footer */}
      <div style={gc.footer}>
        <span style={gc.dates}>
          📅 {goal.week_start} → {goal.week_end}
        </span>
        <button
          style={gc.manageBtn}
          onClick={onNavigate}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--lime)";
            e.currentTarget.style.color = "#080810";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--lime)";
          }}
        >
          Manage tasks →
        </button>
      </div>
    </div>
  );
};

// Dashboard styles
const s = {
  hero: { marginBottom: "2.5rem" },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "99px",
    padding: "0.3rem 0.9rem",
    fontSize: "0.78rem",
    color: "var(--muted)",
    marginBottom: "1rem",
    letterSpacing: "0.04em",
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: "var(--lime)",
    boxShadow: "0 0 8px var(--lime)",
    display: "inline-block",
  },
  heroTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: "0.8rem",
    color: "var(--white)",
  },
  heroName: { color: "var(--lime)" },
  heroSub: { fontSize: "1rem", color: "var(--muted)", maxWidth: 500 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.2rem",
  },
  sectionTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "var(--white)",
  },
  newGoalBtn: {
    background: "var(--lime)",
    color: "#080810",
    border: "none",
    borderRadius: "10px",
    padding: "0.55rem 1.2rem",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    fontFamily: "var(--font-head)",
    boxShadow: "0 4px 20px #c6f13530",
  },
  formCard: {
    background: "var(--card)",
    border: "1px solid var(--lime)30",
    borderRadius: "16px",
    padding: "1.8rem",
    marginBottom: "1.5rem",
    boxShadow: "0 20px 60px #00000040",
  },
  formTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--white)",
    marginBottom: "0.3rem",
  },
  formHint: {
    fontSize: "0.85rem",
    color: "var(--muted)",
    marginBottom: "1.2rem",
  },
  errorBox: {
    background: "#ff4d6d18",
    border: "1px solid #ff4d6d40",
    color: "#ff8099",
    borderRadius: "8px",
    padding: "0.65rem 1rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  field: { marginBottom: "1rem" },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--muted)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
  },
  input: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    color: "var(--white)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)",
  },
  submitBtn: {
    width: "100%",
    background: "var(--lime)",
    color: "#080810",
    border: "none",
    borderRadius: "10px",
    padding: "0.9rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s",
    fontFamily: "var(--font-head)",
    marginTop: "0.5rem",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    gap: "0.8rem",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: "0.5rem" },
  emptyTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "var(--white)",
  },
  emptyText: { color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.7 },
  emptyBtn: {
    marginTop: "1rem",
    background: "var(--lime)",
    color: "#080810",
    border: "none",
    borderRadius: "10px",
    padding: "0.75rem 1.8rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-head)",
  },
  loadingSpinner: {
    width: 36,
    height: 36,
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--lime)",
    borderRadius: "50%",
    animation: "spin-slow 0.8s linear infinite",
  },
  goalsList: { display: "flex", flexDirection: "column", gap: "1rem" },
};

// StatCard styles
const ss = {
  statCard: {
    position: "relative",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "1.4rem",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  statIcon: { fontSize: "1.4rem", marginBottom: "0.6rem" },
  statValue: {
    fontFamily: "var(--font-head)",
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "0.3rem",
  },
  statLabel: { fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500 },
  statGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
};

// GoalCard styles
const gc = {
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "1.6rem",
    transition: "border-color 0.2s, transform 0.2s",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.2rem",
  },
  left: { flex: 1 },
  statusBadge: {
    display: "inline-block",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    border: "1px solid",
    borderRadius: "99px",
    padding: "0.2rem 0.7rem",
    marginBottom: "0.6rem",
  },
  title: {
    fontFamily: "var(--font-head)",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "var(--white)",
    marginBottom: "0.3rem",
  },
  desc: { fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.5 },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    transition: "all 0.2s",
    marginLeft: "1rem",
    flexShrink: 0,
  },
  progressSection: { marginBottom: "1.2rem" },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressLabel: { fontSize: "0.8rem", color: "var(--muted)" },
  progressPct: { fontSize: "0.8rem", fontWeight: 700 },
  track: {
    height: 6,
    background: "var(--surface)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: "0.4rem",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.6s cubic-bezier(.22,.68,0,1.2)",
  },
  taskMeta: { fontSize: "0.78rem", color: "var(--muted)" },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "1rem",
    borderTop: "1px solid var(--border)",
  },
  dates: { fontSize: "0.8rem", color: "var(--muted)" },
  manageBtn: {
    background: "transparent",
    border: "1px solid var(--lime)",
    color: "var(--lime)",
    borderRadius: "8px",
    padding: "0.4rem 1rem",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "var(--font-head)",
  },
};

export default Dashboard;
