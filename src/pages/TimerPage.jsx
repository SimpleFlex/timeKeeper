import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/layout/PageWrapper";

const POMODORO_TIME = 25 * 60;
const FOCUS_MINUTES = 25;

const TimerPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [sessions, setSessions] = useState([]);

  const [seconds, setSeconds] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const [notification, setNotification] = useState(null);
  const [marking, setMarking] = useState(false);

  const sessionStartRef = useRef(null);

  // ---------- Fetch task + goal ----------
  const fetchTask = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("tasks")
      .select("*, goals(title)")
      .eq("id", taskId)
      .single();

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setTask(data);
    setGoalTitle(data?.goals?.title || "");
    setLoading(false);
  }, [taskId]);

  // ---------- Fetch session history ----------
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from("timer_sessions")
      .select("*")
      .eq("task_id", taskId)
      .order("started_at", { ascending: false });

    if (!error && data) setSessions(data);
  }, [taskId]);

  useEffect(() => {
    fetchTask();
    fetchSessions();
  }, [fetchTask, fetchSessions]);

  // ---------- Countdown ----------
  useEffect(() => {
    let interval;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (isRunning && seconds === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, seconds]);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    const startedAt = sessionStartRef.current || new Date().toISOString();
    const completedAt = new Date().toISOString();

    const { error: insertError } = await supabase
      .from("timer_sessions")
      .insert([
        {
          task_id: taskId,
          duration_minutes: FOCUS_MINUTES,
          started_at: startedAt,
          completed_at: completedAt,
        },
      ]);

    if (insertError) {
      setNotification({ type: "error", message: insertError.message });
      setSeconds(POMODORO_TIME);
      return;
    }

    const newTotal = (task?.total_minutes || 0) + FOCUS_MINUTES;

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ total_minutes: newTotal })
      .eq("id", taskId);

    if (updateError) {
      setNotification({ type: "error", message: updateError.message });
      setSeconds(POMODORO_TIME);
      return;
    }

    setTask((prev) => ({ ...prev, total_minutes: newTotal }));
    setNotification({
      type: "success",
      message: `🎉 Focus session complete! ${FOCUS_MINUTES} minutes added.`,
    });

    fetchSessions();
    setSeconds(POMODORO_TIME);
    sessionStartRef.current = null;

    setTimeout(() => setNotification(null), 4000);
  };

  // ---------- Controls ----------
  const handleStart = () => {
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(POMODORO_TIME);
    sessionStartRef.current = null;
  };

  const handleMarkComplete = async () => {
    setMarking(true);

    const { error } = await supabase
      .from("tasks")
      .update({ is_complete: true })
      .eq("id", taskId);

    setMarking(false);

    if (error) {
      setNotification({ type: "error", message: error.message });
      return;
    }

    setTask((prev) => ({ ...prev, is_complete: true }));
    setNotification({ type: "success", message: "✓ Task marked complete!" });
    setTimeout(() => setNotification(null), 4000);
  };

  // ---------- Derived values ----------
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((POMODORO_TIME - seconds) / POMODORO_TIME) * 100;

  const todayStr = new Date().toISOString().slice(0, 10);

  const todaysMinutes = sessions
    .filter((s) => s.completed_at && s.completed_at.slice(0, 10) === todayStr)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const totalTrackedMinutes = task?.total_minutes || 0;

  const status = isRunning
    ? "running"
    : seconds === POMODORO_TIME
      ? "idle"
      : "paused";

  const statusLabel = {
    idle: "Ready to focus",
    running: "Focusing...",
    paused: "Paused",
  }[status];

  // ---------- Render states ----------
  if (loading) {
    return (
      <PageWrapper>
        <div style={s.page}>
          <div style={s.center}>Loading...</div>
        </div>
      </PageWrapper>
    );
  }

  if (loadError || !task) {
    return (
      <PageWrapper>
        <div style={s.page}>
          <div style={s.errorBox}>⚠ {loadError || "Task not found."}</div>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={s.page}>
        {notification && (
          <div
            style={{
              ...s.notification,
              ...(notification.type === "error"
                ? s.notificationError
                : s.notificationSuccess),
            }}
          >
            {notification.message}
          </div>
        )}

        <div style={s.header}>
          <div>
            <p style={s.headerLabel}>{goalTitle || "Goal"}</p>
            <h1 style={s.headerTitle}>{task.title}</h1>
            <p style={s.headerSub}>
              {task.is_complete ? "Completed" : "In progress"} ·{" "}
              {totalTrackedMinutes} min tracked total
            </p>
          </div>

          <button style={s.backBtn} onClick={() => navigate(-1)}>
            ← Back to goals
          </button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard}>
            <p style={s.statLabel}>Today</p>
            <p style={s.statValue}>{todaysMinutes}m</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>Total tracked</p>
            <p style={s.statValue}>{totalTrackedMinutes}m</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>Sessions</p>
            <p style={s.statValue}>{sessions.length}</p>
          </div>
        </div>

        <div style={s.card}>
          <span
            style={{
              ...s.statusBadge,
              background:
                status === "running"
                  ? "#d4f244"
                  : status === "paused"
                    ? "#f472b6"
                    : "#6060a0",
              color: status === "running" ? "#0a0a0a" : "#fff",
            }}
          >
            {statusLabel}
          </span>

          <div style={s.ring}>
            <CircularProgressbar
              value={progress}
              text={formatTime(seconds)}
              styles={buildStyles({
                pathColor: "#d4f244",
                trailColor: "#2a2a3e",
                textColor: "#eeeef5",
                textSize: "16px",
                pathTransitionDuration: 0.5,
              })}
            />
          </div>

          <div style={s.buttons}>
            {!isRunning ? (
              <button style={s.startBtn} onClick={handleStart}>
                ▶ {seconds === POMODORO_TIME ? "Start" : "Resume"}
              </button>
            ) : (
              <button style={s.pauseBtn} onClick={handlePause}>
                ⏸ Pause
              </button>
            )}

            <button style={s.resetBtn} onClick={handleReset}>
              ↺ Reset
            </button>
          </div>

          {!task.is_complete && (
            <button
              style={s.completeTaskBtn}
              disabled={marking}
              onClick={handleMarkComplete}
            >
              {marking ? "Saving..." : "✓ Mark task complete"}
            </button>
          )}

          {task.is_complete && (
            <p style={s.alreadyDoneMsg}>
              ✓ This task is already marked complete.
            </p>
          )}
        </div>

        <div style={s.historyCard}>
          <h3 style={s.historyTitle}>Session history</h3>

          {sessions.length === 0 ? (
            <p style={s.historyEmpty}>
              No sessions yet — start your first focus session above.
            </p>
          ) : (
            <div style={s.historyList}>
              {sessions.map((session) => (
                <div key={session.id} style={s.historyRow}>
                  <div style={s.historyDot} />
                  <div style={s.historyInfo}>
                    <span style={s.historyDuration}>
                      {session.duration_minutes} min
                    </span>
                    <span style={s.historyDate}>
                      {session.completed_at
                        ? new Date(session.completed_at).toLocaleString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "In progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

const s = {
  page: { padding: "32px", maxWidth: "600px", margin: "0 auto" },

  center: { textAlign: "center", padding: "40px", opacity: 0.6 },

  errorBox: {
    background: "#ff4d4d22",
    color: "#ff4d4d",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
  },

  notification: {
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },
  notificationSuccess: {
    background: "#d4f24422",
    color: "#d4f244",
    border: "1px solid #d4f24455",
  },
  notificationError: {
    background: "#ff4d4d22",
    color: "#ff4d4d",
    border: "1px solid #ff4d4d55",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  headerLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    opacity: 0.6,
    margin: 0,
  },
  headerTitle: { fontSize: "26px", fontWeight: 700, margin: "4px 0" },
  headerSub: { opacity: 0.6, margin: 0, fontSize: "14px" },
  backBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    transition: "border-color 0.2s, background 0.2s",
    flexShrink: 0,
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#1e1e2e",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "12px",
    opacity: 0.6,
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: { fontSize: "22px", fontWeight: 700, margin: 0 },

  card: {
    background: "#1e1e2e",
    border: "1px solid #ffffff12",
    borderRadius: "24px",
    padding: "2rem",
    textAlign: "center",
    marginBottom: "24px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "24px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "background 0.3s, color 0.3s",
  },

  ring: {
    width: 220,
    height: 220,
    margin: "0 auto 2rem",
  },

  buttons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },

  startBtn: {
    background: "#d4f244",
    color: "#04040c",
    border: "none",
    padding: ".9rem 1.5rem",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "15px",
    transition: "transform 0.15s, opacity 0.2s",
  },

  pauseBtn: {
    background: "#f472b6",
    color: "#04040c",
    border: "none",
    padding: ".9rem 1.5rem",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "15px",
    transition: "transform 0.15s, opacity 0.2s",
  },

  resetBtn: {
    background: "#222240",
    color: "#fff",
    border: "1px solid #444",
    padding: ".9rem 1.5rem",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "15px",
    transition: "border-color 0.2s, background 0.2s",
  },

  completeTaskBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "1px solid #00f0d455",
    background: "#00f0d422",
    color: "#00f0d4",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  alreadyDoneMsg: {
    color: "#00f0d4",
    fontSize: "14px",
    margin: 0,
    opacity: 0.8,
  },

  historyCard: {
    background: "#1e1e2e",
    borderRadius: "16px",
    padding: "24px",
  },
  historyTitle: {
    margin: "0 0 16px",
    fontSize: "16px",
    fontWeight: 700,
  },
  historyEmpty: {
    opacity: 0.5,
    fontSize: "14px",
    margin: 0,
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "260px",
    overflowY: "auto",
  },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#2a2a3e",
  },
  historyDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#d4f244",
    flexShrink: 0,
  },
  historyInfo: {
    display: "flex",
    justifyContent: "space-between",
    flex: 1,
    fontSize: "14px",
  },
  historyDuration: { fontWeight: 600 },
  historyDate: { opacity: 0.5, fontSize: "13px" },
};

export default TimerPage;
