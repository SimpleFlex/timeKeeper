import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    setLoading(false);
    if (error) return setError(error.message);
    navigate("/dashboard");
  };

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.grid} />

      <div
        style={{ ...s.shape, top: "15%", right: "8%", animationDelay: "0s" }}
      />
      <div
        style={{
          ...s.shape2,
          bottom: "20%",
          left: "6%",
          animationDelay: "1.5s",
        }}
      />
      <div
        style={{
          ...s.shape,
          bottom: "30%",
          right: "5%",
          animationDelay: "0.8s",
          width: 28,
          height: 28,
        }}
      />

      <div style={s.card} className="animate-fadeUp">
        <div style={s.logoWrap} className="animate-fadeUp delay-1">
          <div style={s.logoRing} />
          <span style={s.logoIcon}>⏱</span>
        </div>

        <p style={s.tagline} className="animate-fadeUp delay-2">
          Welcome back, achiever.
        </p>
        <h1 style={s.title} className="animate-fadeUp delay-2">
          Sign in
        </h1>

        {error && (
          <div style={s.errorBox} className="animate-fadeIn">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={submit} style={s.form}>
          <div style={s.field} className="animate-fadeUp delay-3">
            <label style={s.label}>Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              required
              style={s.input}
              onFocus={(e) => (e.target.style.borderColor = "var(--lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div style={s.field} className="animate-fadeUp delay-4">
            <label style={s.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="Your password"
              required
              style={s.input}
              onFocus={(e) => (e.target.style.borderColor = "var(--lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
            className="animate-fadeUp delay-5"
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              "●●●"
            ) : (
              <>
                Let's go <span style={s.arrow}>→</span>
              </>
            )}
          </button>
        </form>

        <p style={s.footer} className="animate-fadeUp delay-5">
          No account yet?{" "}
          <Link to="/register" style={s.footerLink}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--black)",
    position: "relative",
    overflow: "hidden",
    padding: "2rem 1rem",
  },
  blob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, #00e5cc14 0%, transparent 70%)",
    top: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    width: 440,
    height: 440,
    borderRadius: "50%",
    background: "radial-gradient(circle, #c6f13514 0%, transparent 70%)",
    bottom: "-80px",
    right: "-60px",
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    opacity: 0.4,
    pointerEvents: "none",
  },
  shape: {
    position: "absolute",
    width: 40,
    height: 40,
    border: "2px solid #c6f13540",
    borderRadius: "8px",
    animation: "float 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  shape2: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#c6f13520",
    borderRadius: "50%",
    animation: "float 9s ease-in-out infinite",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 10,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "24px",
    padding: "3rem 2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 40px 80px #00000060, 0 0 0 1px #ffffff08",
    backdropFilter: "blur(20px)",
  },
  logoWrap: {
    position: "relative",
    width: 56,
    height: 56,
    marginBottom: "1.5rem",
  },
  logoRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2px solid var(--cyan)",
    animation: "pulse-ring 2s ease-out infinite",
  },
  logoIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.6rem",
    background: "var(--surface)",
    borderRadius: "50%",
    border: "1px solid var(--border)",
  },
  tagline: {
    fontSize: "0.78rem",
    color: "var(--cyan)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: "0.4rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "var(--white)",
    marginBottom: "2rem",
    fontFamily: "var(--font-head)",
  },
  errorBox: {
    background: "#ff4d6d18",
    border: "1px solid #ff4d6d40",
    color: "#ff8099",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    fontSize: "0.88rem",
    marginBottom: "1.2rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.2rem" },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "0.8rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--muted)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  input: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.85rem 1.1rem",
    color: "var(--white)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
  },
  btn: {
    marginTop: "0.8rem",
    background: "var(--lime)",
    color: "#080810",
    border: "none",
    borderRadius: "12px",
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 8px 30px #c6f13530",
    fontFamily: "var(--font-head)",
    letterSpacing: "0.02em",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  arrow: { fontSize: "1.1rem" },
  footer: {
    textAlign: "center",
    marginTop: "1.8rem",
    fontSize: "0.9rem",
    color: "var(--muted)",
  },
  footerLink: {
    color: "var(--lime)",
    fontWeight: 600,
  },
};

export default Login;
