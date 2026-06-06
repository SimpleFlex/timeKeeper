import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useGoals } from "../hooks/useGoals";
import PageWrapper from "../components/layout/PageWrapper";

const Goals = () => {
  const { goals, loading, createGoal, deleteGoal, fetchGoals } = useGoals();
  const navigate = useNavigate();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [activeGoalId, setActiveGoalId] = useState(null);

  // Task states
  const [taskInputs, setTaskInputs] = useState({});
  const [addingTask, setAddingTask] = useState({});
  const [taskError, setTaskError] = useState({});

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return setGoalError("Goal title is required");
    setCreating(true);
    const { data, error } = await createGoal(
      goalForm.title,
      goalForm.description,
    );
    setCreating(false);
    if (error) return setGoalError(error.message);
    setGoalForm({ title: "", description: "" });
    setShowGoalForm(false);
    setGoalError("");
    setActiveGoalId(data.id);
  };

  const handleAddTask = async (goalId) => {
    const title = taskInputs[goalId]?.trim();
    if (!title)
      return setTaskError({ ...taskError, [goalId]: "Task title is required" });
    setAddingTask({ ...addingTask, [goalId]: true });

    const taskCount = goals.find((g) => g.id === goalId)?.tasks?.length || 0;
    const { error } = await supabase.from("tasks").insert([
      {
        goal_id: goalId,
        title,
        sort_order: taskCount,
      },
    ]);

    setAddingTask({ ...addingTask, [goalId]: false });
    if (error) return setTaskError({ ...taskError, [goalId]: error.message });
    setTaskInputs({ ...taskInputs, [goalId]: "" });
    setTaskError({ ...taskError, [goalId]: "" });
    fetchGoals();
  };

  const handleToggleTask = async (task) => {
    await supabase
      .from("tasks")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);
    fetchGoals();
  };

  const handleDeleteTask = async (taskId) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchGoals();
  };

  const statusColor = (status) =>
    ({
      active: "#d4f244",
      completed: "#00f0d4",
      rolled_over: "#f472b6",
    })[status] || "#6060a0";

  return (
    <PageWrapper>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header} className="animate-fadeUp">
          <div>
            <p style={s.headerLabel}>Weekly goals</p>
            <h1 style={s.headerTitle}>Your goal board</h1>
            <p style={s.headerSub}>
              Break every goal into tasks. Track every task.
            </p>
          </div>
          <button
            style={s.newBtn}
            onClick={() => setShowGoalForm(!showGoalForm)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {showGoalForm ? "✕ Cancel" : "+ New goal"}
          </button>
        </div>

        {/* Create goal form */}
        {showGoalForm && (
          <div style={s.formCard} className="animate-fadeUp">
            <h3 style={s.formTitle}>Set your weekly goal</h3>
            <p style={s.formHint}>
              Be specific. What will you have shipped by Sunday?
            </p>
            {goalError && <div style={s.errorBox}>⚠ {goalError}</div>}
            <form onSubmit={handleCreateGoal}>
              <div style={s.field}>
                <label style={s.label}>Goal title</label>
                <input
                  value={goalForm.title}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, title: e.target.value })
                  }
                  placeholder="e.g. Launch my portfolio website"
                  style={s.input}
                  onFocus={(e) => (e.target.style.borderColor = "#d4f244")}
                  onBlur={(e) => (e.target.style.borderColor = "#ffffff12")}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Why does this matter? (optional)</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, description: e.target.value })
                  }
                  placeholder="Your motivation..."
                  rows={3}
                  style={{ ...s.input, resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d4f244")}
                  onBlur={(e) => (e.target.style.borderColor = "#ffffff12")}
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
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={{ color: "#6060a0", marginTop: "1rem" }}>
              Loading goals...
            </p>
          </div>
        ) : goals.length === 0 ? (
          <div style={s.empty} className="animate-fadeUp">
            <div style={s.emptyIcon}>🎯</div>
            <h3 style={s.emptyTitle}>No goals yet</h3>
            <p style={s.emptySub}>
              Set your first goal for this week and start building momentum.
            </p>
            <button style={s.emptyBtn} onClick={() => setShowGoalForm(true)}>
              Set my first goal
            </button>
          </div>
        ) : (
          <div style={s.goalsList}>
            {goals.map((goal, i) => {
              const tasks = goal.tasks || [];
              const done = tasks.filter((t) => t.is_complete).length;
              const pct = goal.progress_pct || 0;
              const isOpen = activeGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  style={s.goalCard}
                  className={`animate-fadeUp delay-${Math.min(i + 1, 5)}`}
                >
                  {/* Goal header */}
                  <div style={s.goalTop}>
                    <div style={s.goalLeft}>
                      <span
                        style={{
                          ...s.statusBadge,
                          color: statusColor(goal.status),
                          borderColor: statusColor(goal.status) + "40",
                          backgroundColor: statusColor(goal.status) + "12",
                        }}
                      >
                        {goal.status === "completed"
                          ? "✓ Completed"
                          : goal.status === "rolled_over"
                            ? "↻ Rolled over"
                            : "● Active"}
                      </span>
                      <h2 style={s.goalTitle}>{goal.title}</h2>
                      {goal.description && (
                        <p style={s.goalDesc}>{goal.description}</p>
                      )}
                    </div>
                    <div style={s.goalActions}>
                      <button
                        style={s.expandBtn}
                        onClick={() => setActiveGoalId(isOpen ? null : goal.id)}
                      >
                        {isOpen ? "▲ Hide tasks" : "▼ Show tasks"}
                      </button>
                      <button
                        style={s.deleteGoalBtn}
                        onClick={() => deleteGoal(goal.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#ff4d6d22";
                          e.currentTarget.style.color = "#ff4d6d";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#6060a0";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={s.progressSection}>
                    <div style={s.progressMeta}>
                      <span style={s.progressLabel}>
                        {done} of {tasks.length} tasks complete
                      </span>
                      <span
                        style={{
                          ...s.progressPct,
                          color: pct === 100 ? "#00f0d4" : "#d4f244",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div style={s.track}>
                      <div
                        style={{
                          ...s.fill,
                          width: `${pct}%`,
                          backgroundColor: pct === 100 ? "#00f0d4" : "#d4f244",
                        }}
                      />
                    </div>
                  </div>

                  {/* Tasks section */}
                  {isOpen && (
                    <div style={s.tasksSection} className="animate-fadeIn">
                      <div style={s.tasksDivider} />

                      {/* Task list */}
                      {tasks.length === 0 ? (
                        <p style={s.noTasks}>
                          No tasks yet — add your first one below.
                        </p>
                      ) : (
                        <div style={s.tasksList}>
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              style={{
                                ...s.taskRow,
                                opacity: task.is_complete ? 0.6 : 1,
                              }}
                            >
                              {/* Checkbox */}
                              <button
                                style={{
                                  ...s.checkbox,
                                  backgroundColor: task.is_complete
                                    ? "#d4f244"
                                    : "transparent",
                                  borderColor: task.is_complete
                                    ? "#d4f244"
                                    : "#ffffff20",
                                }}
                                onClick={() => handleToggleTask(task)}
                              >
                                {task.is_complete && (
                                  <span style={s.checkmark}>✓</span>
                                )}
                              </button>

                              {/* Task info */}
                              <div style={s.taskInfo}>
                                <span
                                  style={{
                                    ...s.taskTitle,
                                    textDecoration: task.is_complete
                                      ? "line-through"
                                      : "none",
                                    color: task.is_complete
                                      ? "#6060a0"
                                      : "#eeeef5",
                                  }}
                                >
                                  {task.title}
                                </span>
                                {task.total_minutes > 0 && (
                                  <span style={s.taskTime}>
                                    ⏱ {task.total_minutes}m tracked
                                  </span>
                                )}
                              </div>

                              {/* Task actions */}
                              <div style={s.taskActions}>
                                <button
                                  style={s.timerBtn}
                                  onClick={() => navigate(`/timer/${task.id}`)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#d4f24420";
                                    e.currentTarget.style.color = "#d4f244";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color = "#6060a0";
                                  }}
                                >
                                  ⏱ Timer
                                </button>
                                <button
                                  style={s.deleteTaskBtn}
                                  onClick={() => handleDeleteTask(task.id)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#ff4d6d";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#6060a0";
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add task input */}
                      <div style={s.addTaskRow}>
                        <input
                          value={taskInputs[goal.id] || ""}
                          onChange={(e) =>
                            setTaskInputs({
                              ...taskInputs,
                              [goal.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddTask(goal.id)
                          }
                          placeholder="Add a task and press Enter..."
                          style={s.taskInput}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#d4f244")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#ffffff12")
                          }
                        />
                        <button
                          style={s.addTaskBtn}
                          onClick={() => handleAddTask(goal.id)}
                          disabled={addingTask[goal.id]}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform =
                              "translateY(-2px)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                          }
                        >
                          {addingTask[goal.id] ? "●●●" : "+ Add"}
                        </button>
                      </div>
                      {taskError[goal.id] && (
                        <p style={s.taskErrorMsg}>⚠ {taskError[goal.id]}</p>
                      )}

                      {/* Footer */}
                      <div style={s.goalFooter}>
                        <span style={s.goalDates}>
                          📅 {goal.week_start} → {goal.week_end}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

const s = {
  page: { paddingBottom: "4rem" },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "2.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLabel: {
    fontSize: "0.78rem",
    color: "#d4f244",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "0.4rem",
  },
  headerTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "clamp(1.8rem,4vw,2.8rem)",
    fontWeight: 800,
    color: "#eeeef5",
    marginBottom: "0.4rem",
  },
  headerSub: { fontSize: "0.95rem", color: "#6060a0" },
  newBtn: {
    background: "#d4f244",
    color: "#04040c",
    border: "none",
    borderRadius: "10px",
    padding: "0.65rem 1.4rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    fontFamily: "var(--font-head)",
    boxShadow: "0 4px 20px #d4f24430",
    whiteSpace: "nowrap",
  },
  formCard: {
    background: "#13132a",
    border: "1px solid #d4f24430",
    borderRadius: "16px",
    padding: "1.8rem",
    marginBottom: "2rem",
    boxShadow: "0 20px 60px #00000040",
  },
  formTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#eeeef5",
    marginBottom: "0.3rem",
  },
  formHint: { fontSize: "0.85rem", color: "#6060a0", marginBottom: "1.2rem" },
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
    color: "#6060a0",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
  },
  input: {
    width: "100%",
    background: "#0e0e20",
    border: "1px solid #ffffff12",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    color: "#eeeef5",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)",
  },
  submitBtn: {
    width: "100%",
    background: "#d4f244",
    color: "#04040c",
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
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4rem 0",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #ffffff12",
    borderTop: "3px solid #d4f244",
    borderRadius: "50%",
    animation: "spin-slow 0.8s linear infinite",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4rem 2rem",
    textAlign: "center",
    gap: "0.8rem",
  },
  emptyIcon: { fontSize: "3rem", marginBottom: "0.5rem" },
  emptyTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#eeeef5",
  },
  emptySub: { color: "#6060a0", fontSize: "0.95rem" },
  emptyBtn: {
    marginTop: "1rem",
    background: "#d4f244",
    color: "#04040c",
    border: "none",
    borderRadius: "10px",
    padding: "0.75rem 1.8rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-head)",
  },
  goalsList: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  goalCard: {
    background: "#13132a",
    border: "1px solid #ffffff12",
    borderRadius: "20px",
    padding: "1.8rem",
    transition: "border-color 0.2s",
  },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.2rem",
    gap: "1rem",
  },
  goalLeft: { flex: 1 },
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
  goalTitle: {
    fontFamily: "var(--font-head)",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#eeeef5",
    marginBottom: "0.3rem",
  },
  goalDesc: { fontSize: "0.88rem", color: "#6060a0", lineHeight: 1.5 },
  goalActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: 0,
  },
  expandBtn: {
    background: "#0e0e20",
    border: "1px solid #ffffff12",
    color: "#6060a0",
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "var(--font-body)",
    whiteSpace: "nowrap",
  },
  deleteGoalBtn: {
    background: "transparent",
    border: "none",
    color: "#6060a0",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  progressSection: { marginBottom: "0.5rem" },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressLabel: { fontSize: "0.8rem", color: "#6060a0" },
  progressPct: { fontSize: "0.8rem", fontWeight: 700 },
  track: {
    height: 6,
    background: "#0e0e20",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.6s cubic-bezier(.22,.68,0,1.2)",
  },
  tasksSection: { marginTop: "1.2rem" },
  tasksDivider: {
    height: 1,
    background: "#ffffff08",
    marginBottom: "1.2rem",
  },
  noTasks: {
    fontSize: "0.88rem",
    color: "#6060a0",
    textAlign: "center",
    padding: "1rem 0",
  },
  tasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    marginBottom: "1.2rem",
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    padding: "0.75rem 1rem",
    background: "#0e0e20",
    borderRadius: "10px",
    border: "1px solid #ffffff08",
    transition: "opacity 0.2s",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: "6px",
    border: "1.5px solid",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  checkmark: { fontSize: "0.7rem", color: "#04040c", fontWeight: 900 },
  taskInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  taskTitle: { fontSize: "0.92rem", fontWeight: 500, transition: "all 0.2s" },
  taskTime: { fontSize: "0.75rem", color: "#6060a0" },
  taskActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flexShrink: 0,
  },
  timerBtn: {
    background: "transparent",
    border: "1px solid #ffffff12",
    color: "#6060a0",
    borderRadius: "7px",
    padding: "0.3rem 0.7rem",
    fontSize: "0.78rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "var(--font-body)",
  },
  deleteTaskBtn: {
    background: "transparent",
    border: "none",
    color: "#6060a0",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "0.3rem",
    transition: "color 0.2s",
  },
  addTaskRow: {
    display: "flex",
    gap: "0.6rem",
    marginBottom: "0.5rem",
  },
  taskInput: {
    flex: 1,
    background: "#0e0e20",
    border: "1px solid #ffffff12",
    borderRadius: "10px",
    padding: "0.7rem 1rem",
    color: "#eeeef5",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-body)",
  },
  addTaskBtn: {
    background: "#d4f244",
    color: "#04040c",
    border: "none",
    borderRadius: "10px",
    padding: "0.7rem 1.2rem",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s",
    fontFamily: "var(--font-head)",
    whiteSpace: "nowrap",
  },
  taskErrorMsg: {
    fontSize: "0.8rem",
    color: "#ff8099",
    marginBottom: "0.8rem",
  },
  goalFooter: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #ffffff08",
  },
  goalDates: { fontSize: "0.8rem", color: "#6060a0" },
};

export default Goals;
