import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) return setError("Full name is required");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (error) return setError(error.message);
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const strength =
    form.password.length === 0
      ? null
      : form.password.length < 6
        ? "weak"
        : form.password.length < 10
          ? "good"
          : "strong";
  const strengthColor = { weak: "#ff4d6d", good: "#f5c842", strong: "#d4f244" };
  const strengthWidth = { weak: "30%", good: "65%", strong: "100%" };

  return (
    <>
      <style>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#04040c;position:relative;overflow:hidden;padding:1.5rem 1rem}
        .auth-blob1{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,#d4f24418 0%,transparent 70%);top:-150px;right:-100px;pointer-events:none}
        .auth-blob2{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#00f0d412 0%,transparent 70%);bottom:-100px;left:-80px;pointer-events:none}
        .auth-grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff0e 1px,transparent 1px),linear-gradient(90deg,#ffffff0e 1px,transparent 1px);background-size:60px 60px;opacity:0.3;pointer-events:none}
        .auth-card{position:relative;z-index:10;background:#13132a;border:1px solid #ffffff12;border-radius:20px;padding:2rem 1.8rem;width:100%;max-width:400px;box-shadow:0 30px 70px #00000070}
        .auth-top{display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem}
        .auth-logo{width:38px;height:38px;border-radius:10px;background:#d4f244;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#04040c;font-weight:900;box-shadow:0 0 16px #d4f24450;flex-shrink:0}
        .auth-brand{font-family:'Clash Display',sans-serif;font-weight:700;font-size:1rem;color:#eeeef5}
        .auth-title{font-family:'Clash Display',sans-serif;font-size:1.5rem;font-weight:800;color:#eeeef5;margin-bottom:0.2rem}
        .auth-sub{font-size:0.82rem;color:#6060a0;margin-bottom:1.4rem}
        .auth-error{background:#ff4d6d18;border:1px solid #ff4d6d40;color:#ff8099;border-radius:8px;padding:0.6rem 0.9rem;font-size:0.82rem;margin-bottom:0.9rem}
        .auth-success{background:#d4f24418;border:1px solid #d4f24440;color:#d4f244;border-radius:8px;padding:0.6rem 0.9rem;font-size:0.82rem;margin-bottom:0.9rem;text-align:center}
        .auth-google-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:0.7rem;background:#ffffff0a;border:1px solid #ffffff18;border-radius:10px;padding:0.7rem;color:#eeeef5;font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:'Cabinet Grotesk',sans-serif;margin-bottom:1rem}
        .auth-google-btn:hover:not(:disabled){background:#ffffff14;border-color:#ffffff28;transform:translateY(-1px)}
        .auth-google-btn:disabled{opacity:0.6;cursor:not-allowed}
        .auth-google-icon{width:18px;height:18px;flex-shrink:0}
        .auth-divider-row{display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem}
        .auth-divider-line{flex:1;height:1px;background:#ffffff10}
        .auth-divider-text{font-size:0.75rem;color:#6060a0;white-space:nowrap}
        .auth-field{display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.7rem}
        .auth-label{font-size:0.74rem;font-weight:700;color:#6060a0;letter-spacing:0.06em;text-transform:uppercase}
        .auth-input{background:#0e0e20;border:1px solid #ffffff12;border-radius:8px;padding:0.65rem 0.9rem;color:#eeeef5;font-size:0.9rem;outline:none;transition:border-color 0.2s;width:100%;font-family:'Cabinet Grotesk',sans-serif}
        .auth-input:focus{border-color:#d4f244}
        .auth-strength-wrap{display:flex;align-items:center;gap:0.8rem;margin-top:-0.3rem;margin-bottom:0.6rem}
        .auth-strength-track{flex:1;height:3px;background:#0e0e20;border-radius:99px;overflow:hidden}
        .auth-strength-bar{height:100%;border-radius:99px;transition:width 0.4s,background-color 0.4s}
        .auth-strength-lbl{font-size:0.68rem;font-weight:700;min-width:44px;text-align:right}
        .auth-btn{width:100%;margin-top:0.5rem;background:#d4f244;color:#04040c;border:none;border-radius:10px;padding:0.8rem;font-size:0.92rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 6px 24px #d4f24430;font-family:'Clash Display',sans-serif}
        .auth-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 36px #d4f24450}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed}
        .auth-footer{text-align:center;margin-top:1.2rem;font-size:0.84rem;color:#6060a0}
        .auth-footer a{color:#d4f244;font-weight:700;text-decoration:none}
        @keyframes authFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(3deg)}}
        @media(max-width:480px){.auth-card{padding:1.6rem 1.3rem}}
      `}</style>

      <div className="auth-page">
        <div className="auth-blob1" />
        <div className="auth-blob2" />
        <div className="auth-grid" />

        <div className="auth-card animate-fadeUp">
          {/* Brand top */}
          <div className="auth-top">
            <div className="auth-logo">⏱</div>
            <span className="auth-brand">TimeKeeper</span>
          </div>

          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">
            Set your first goal. Ship something this week.
          </p>

          {error && <div className="auth-error">⚠ {error}</div>}
          {success && (
            <div className="auth-success">
              ✓ Account created! Redirecting...
            </div>
          )}

          {/* Google button */}
          <button
            className="auth-google-btn"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              "●●●"
            ) : (
              <>
                <svg className="auth-google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="auth-divider-row">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or sign up with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={submit}>
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                name="fullName"
                value={form.fullName}
                onChange={handle}
                placeholder="Laxman Prima"
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            {strength && (
              <div className="auth-strength-wrap">
                <div className="auth-strength-track">
                  <div
                    className="auth-strength-bar"
                    style={{
                      width: strengthWidth[strength],
                      backgroundColor: strengthColor[strength],
                    }}
                  />
                </div>
                <span
                  className="auth-strength-lbl"
                  style={{ color: strengthColor[strength] }}
                >
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "●●●" : <>Create account →</>}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
