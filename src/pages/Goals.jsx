import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useGoals } from "../hooks/useGoals";
import PageWrapper from "../components/layout/PageWrapper";

const Goals = () => {
  const navigate = useNavigate();
  const { goals, loading, createGoal, deleteGoal, fetchGoals } = useGoals();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [activeGoalId, setActiveGoalId] = useState(null);

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
    setActiveGoalId(data?.id);
  };

  const handleAddTask = async (goalId) => {
    const title = taskInputs[goalId]?.trim();

    if (!title) {
      setTaskError({
        ...taskError,
        [goalId]: "Task title is required",
      });
      return;
    }

    setAddingTask({ ...addingTask, [goalId]: true });

    const taskCount = goals.find((g) => g.id === goalId)?.tasks?.length || 0;

    const { error } = await supabase.from("tasks").insert([
      {
        goal_id: goalId,
        title,
        sort_order: taskCount,
        is_complete: false,
      },
    ]);

    setAddingTask({ ...addingTask, [goalId]: false });

    if (error) {
      setTaskError({
        ...taskError,
        [goalId]: error.message,
      });
      return;
    }

    setTaskInputs({ ...taskInputs, [goalId]: "" });
    setTaskError({ ...taskError, [goalId]: "" });
    fetchGoals();
  };

  const handleToggleTask = async (task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);

    if (error) return console.log(error.message);

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
        <div style={s.header}>
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
          >
            {showGoalForm ? "✕ Cancel" : "+ New goal"}
          </button>
        </div>

        {/* Form */}
        {showGoalForm && (
          <div style={s.formCard}>
            <h3 style={s.formTitle}>Set your weekly goal</h3>

            {goalError && <div style={s.errorBox}>⚠ {goalError}</div>}

            <form onSubmit={handleCreateGoal}>
              <div style={s.field}>
                <label style={s.label}>Goal title</label>
                <input
                  value={goalForm.title}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, title: e.target.value })
                  }
                  style={s.input}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Description</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) =>
                    setGoalForm({
                      ...goalForm,
                      description: e.target.value,
                    })
                  }
                  style={s.input}
                />
              </div>

              <button style={s.submitBtn} disabled={creating}>
                {creating ? "Loading..." : "Create Goal"}
              </button>
            </form>
          </div>
        )}

        {/* Goals */}
        {loading ? (
          <div style={s.center}>Loading...</div>
        ) : (
          <div style={s.goalsList}>
            {goals.map((goal) => {
              const tasks = Array.isArray(goal.tasks) ? goal.tasks : [];

              const done = tasks.filter((t) => t.is_complete).length;

              const pct =
                tasks.length === 0
                  ? 0
                  : Math.round((done / tasks.length) * 100);

              const isOpen = activeGoalId === goal.id;

              return (
                <div key={goal.id} style={s.goalCard}>
                  <div style={s.goalTop}>
                    <div style={s.goalLeft}>
                      <span
                        style={{
                          ...s.statusBadge,
                          background: statusColor(goal.status),
                        }}
                      >
                        {goal.status}
                      </span>

                      <h2 style={s.goalTitle}>{goal.title}</h2>

                      <p style={s.goalDesc}>{goal.description}</p>
                    </div>

                    <div style={s.goalActions}>
                      <button
                        style={s.expandBtn}
                        onClick={() => setActiveGoalId(isOpen ? null : goal.id)}
                      >
                        Tasks
                      </button>

                      <button
                        style={s.deleteGoalBtn}
                        onClick={() => deleteGoal(goal.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={s.progressSection}>
                    <div style={s.progressMeta}>
                      <span style={s.progressLabel}>
                        {done}/{tasks.length}
                      </span>
                      <span style={s.progressPct}>{pct}%</span>
                    </div>

                    <div style={s.track}>
                      <div style={{ ...s.fill, width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Tasks */}
                  {isOpen && (
                    <div style={s.tasksSection}>
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          style={{
                            ...s.taskRow,
                            ...(task.is_complete ? s.taskRowDone : {}),
                          }}
                        >
                          <button
                            style={{
                              ...s.checkbox,
                              ...(task.is_complete ? s.checkboxChecked : {}),
                            }}
                            onClick={() => handleToggleTask(task)}
                            aria-label={
                              task.is_complete
                                ? "Mark task incomplete"
                                : "Mark task complete"
                            }
                          >
                            {task.is_complete ? "✓" : ""}
                          </button>

                          <span
                            style={{
                              ...s.taskTitle,
                              ...(task.is_complete ? s.taskTitleDone : {}),
                            }}
                          >
                            {task.title}
                          </span>

                          <button
                            style={s.timerBtn}
                            onClick={() => navigate(`/timer/${task.id}`)}
                            aria-label="Start focus timer for this task"
                          >
                            ⏱
                          </button>

                          <button
                            style={s.taskDeleteBtn}
                            onClick={() => handleDeleteTask(task.id)}
                            aria-label="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <div style={s.addTaskRow}>
                        <input
                          value={taskInputs[goal.id] || ""}
                          onChange={(e) =>
                            setTaskInputs({
                              ...taskInputs,
                              [goal.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTask(goal.id);
                          }}
                          placeholder="Add a task..."
                          style={s.taskInput}
                        />

                        <button
                          style={{
                            ...s.addTaskBtn,
                            ...(addingTask[goal.id]
                              ? s.addTaskBtnDisabled
                              : {}),
                          }}
                          disabled={addingTask[goal.id]}
                          onClick={() => handleAddTask(goal.id)}
                        >
                          {addingTask[goal.id] ? "Adding..." : "+ Add"}
                        </button>
                      </div>

                      {taskError[goal.id] && (
                        <p style={s.taskErrorMsg}>⚠ {taskError[goal.id]}</p>
                      )}
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
  page: { padding: "32px", maxWidth: "800px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },
  headerLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    opacity: 0.6,
    margin: 0,
  },
  headerTitle: { fontSize: "28px", fontWeight: 700, margin: "4px 0" },
  headerSub: { opacity: 0.6, margin: 0 },
  newBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#d4f244",
    fontWeight: 600,
    cursor: "pointer",
  },
  formCard: {
    background: "#1e1e2e",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  formTitle: { margin: "0 0 16px", fontWeight: 600 },
  errorBox: {
    background: "#ff4d4d22",
    color: "#ff4d4d",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  field: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    opacity: 0.8,
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#2a2a3e",
    color: "#fff",
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#d4f244",
    fontWeight: 600,
    cursor: "pointer",
  },
  center: { textAlign: "center", padding: "40px", opacity: 0.6 },
  goalsList: { display: "flex", flexDirection: "column", gap: "16px" },
  goalCard: { background: "#1e1e2e", borderRadius: "12px", padding: "20px" },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  goalLeft: { flex: 1 },
  statusBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#000",
  },
  goalTitle: { fontSize: "18px", fontWeight: 600, margin: "0 0 4px" },
  goalDesc: { opacity: 0.6, margin: 0, fontSize: "14px" },
  goalActions: { display: "flex", gap: "8px", alignItems: "center" },
  expandBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  deleteGoalBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4d22",
    color: "#ff4d4d",
    cursor: "pointer",
  },
  progressSection: { marginBottom: "8px" },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    fontSize: "13px",
  },
  progressLabel: { opacity: 0.6 },
  progressPct: { fontWeight: 600 },
  track: { height: "6px", borderRadius: "4px", background: "#333" },
  fill: {
    height: "100%",
    borderRadius: "4px",
    background: "#d4f244",
    transition: "width 0.3s",
  },
  tasksSection: {
    marginTop: "16px",
    borderTop: "1px solid #333",
    paddingTop: "16px",
  },

  /* --- Task row --- */
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#2a2a3e",
    transition: "background 0.2s, opacity 0.2s",
  },
  taskRowDone: {
    background: "#23233380",
    opacity: 0.6,
  },

  /* --- Checkbox button --- */
  checkbox: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "transparent",
    color: "#0a0a0a",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    transition: "background 0.2s, border-color 0.2s",
    padding: 0,
  },
  checkboxChecked: {
    background: "#d4f244",
    borderColor: "#d4f244",
  },

  /* --- Task title --- */
  taskTitle: {
    flex: 1,
    fontSize: "14px",
    color: "#fff",
  },
  taskTitleDone: {
    textDecoration: "line-through",
    opacity: 0.6,
  },

  /* --- Timer button --- */
  timerBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "1px solid #d4f24455",
    background: "#d4f24422",
    color: "#d4f244",
    cursor: "pointer",
    flexShrink: 0,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, transform 0.15s",
  },

  /* --- Delete task button --- */
  taskDeleteBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "none",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    flexShrink: 0,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, color 0.2s",
  },

  /* --- Add task row --- */
  addTaskRow: { display: "flex", gap: "8px", marginTop: "12px" },
  taskInput: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#2a2a3e",
    color: "#fff",
    fontSize: "14px",
  },
  addTaskBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#d4f244",
    color: "#0a0a0a",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  addTaskBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  taskErrorMsg: { color: "#ff4d4d", fontSize: "13px", margin: "6px 0 0" },
};

export default Goals;
