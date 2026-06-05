// import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={s.nav}>
      {/* Left — brand */}
      <Link to="/dashboard" style={s.brand}>
        <span style={s.brandIcon}>⏱</span>
        <span style={s.brandText}>TimeKeeper</span>
      </Link>

      {/* Center — nav links */}
      {user && (
        <div style={s.links}>
          <Link
            to="/dashboard"
            style={{
              ...s.link,
              ...(isActive("/dashboard") ? s.linkActive : {}),
            }}
          >
            <span>Dashboard</span>
            {isActive("/dashboard") && <div style={s.linkDot} />}
          </Link>
          <Link
            to="/goals"
            style={{ ...s.link, ...(isActive("/goals") ? s.linkActive : {}) }}
          >
            <span>Goals</span>
            {isActive("/goals") && <div style={s.linkDot} />}
          </Link>
        </div>
      )}

      {/* Right — user info + signout */}
      {user && (
        <div style={s.right}>
          <div style={s.avatar}>
            {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
              user.email[0].toUpperCase()}
          </div>
          <span style={s.userName}>
            {user.user_metadata?.full_name?.split(" ")[0] || "Achiever"}
          </span>
          <button
            onClick={handleSignOut}
            style={s.signOutBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff4d6d22")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

const s = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    height: "64px",
    background: "#080810ee",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    textDecoration: "none",
  },
  brandIcon: {
    fontSize: "1.4rem",
    filter: "drop-shadow(0 0 8px #c6f135aa)",
  },
  brandText: {
    fontFamily: "var(--font-head)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "var(--white)",
    letterSpacing: "0.02em",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  link: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    color: "var(--muted)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  linkActive: {
    color: "var(--lime)",
    fontWeight: 700,
  },
  linkDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: "var(--lime)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--lime), var(--cyan))",
    color: "#080810",
    fontWeight: 800,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-head)",
  },
  userName: {
    fontSize: "0.88rem",
    color: "var(--white)",
    fontWeight: 500,
  },
  signOutBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    borderRadius: "8px",
    padding: "0.35rem 0.9rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
    fontFamily: "var(--font-body)",
  },
};

export default Navbar;
