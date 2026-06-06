import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={s.nav}>
        <Link to={user ? "/dashboard" : "/"} style={s.brand}>
          <span style={s.brandIcon}>⏱</span>
          <span style={s.brandText}>TimeKeeper</span>
        </Link>

        {/* Desktop links */}
        {user && (
          <div style={s.links}>
            <Link
              to="/dashboard"
              style={{
                ...s.link,
                ...(isActive("/dashboard") ? s.linkActive : {}),
              }}
            >
              Dashboard
              {isActive("/dashboard") && <div style={s.linkDot} />}
            </Link>
            <Link
              to="/goals"
              style={{ ...s.link, ...(isActive("/goals") ? s.linkActive : {}) }}
            >
              Goals
              {isActive("/goals") && <div style={s.linkDot} />}
            </Link>
          </div>
        )}

        {/* Desktop right */}
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
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#ff4d6d22")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              Sign out
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {user && (
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div style={s.mobileMenu}>
          <div style={s.mobileUser}>
            <div style={s.avatar}>
              {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                user.email[0].toUpperCase()}
            </div>
            <span style={s.userName}>
              {user.user_metadata?.full_name || "Achiever"}
            </span>
          </div>
          <Link
            to="/dashboard"
            style={s.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/goals"
            style={s.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            🎯 Goals
          </Link>
          <button style={s.mobileSignOut} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </>
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
    padding: "0 clamp(1rem, 4vw, 2rem)",
    height: "64px",
    background: "#080810ee",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #ffffff12",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    textDecoration: "none",
  },
  brandIcon: {
    fontSize: "1.4rem",
    filter: "drop-shadow(0 0 8px #d4f244aa)",
  },
  brandText: {
    fontFamily: "var(--font-head)",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "#eeeef5",
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
    color: "#6060a0",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  linkActive: {
    color: "#d4f244",
    fontWeight: 700,
  },
  linkDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: "#d4f244",
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
    background: "linear-gradient(135deg, #d4f244, #00f0d4)",
    color: "#080810",
    fontWeight: 800,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-head)",
    flexShrink: 0,
  },
  userName: {
    fontSize: "0.88rem",
    color: "#eeeef5",
    fontWeight: 500,
  },
  signOutBtn: {
    background: "transparent",
    border: "1px solid #ffffff12",
    color: "#6060a0",
    borderRadius: "8px",
    padding: "0.35rem 0.9rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontFamily: "var(--font-body)",
  },
  hamburger: {
    display: "none",
    background: "transparent",
    border: "1px solid #ffffff12",
    color: "#eeeef5",
    borderRadius: "8px",
    padding: "0.4rem 0.7rem",
    fontSize: "1.1rem",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    [`@media(max-width:768px)`]: { display: "block" },
  },
  mobileMenu: {
    position: "fixed",
    top: "64px",
    left: 0,
    right: 0,
    zIndex: 99,
    background: "#0e0e20",
    borderBottom: "1px solid #ffffff12",
    padding: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  mobileUser: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    padding: "0.5rem 0 1rem",
    borderBottom: "1px solid #ffffff08",
    marginBottom: "0.5rem",
  },
  mobileLink: {
    display: "block",
    padding: "0.8rem 1rem",
    borderRadius: "10px",
    color: "#eeeef5",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    background: "#ffffff06",
    border: "1px solid #ffffff08",
  },
  mobileSignOut: {
    marginTop: "0.5rem",
    background: "#ff4d6d18",
    border: "1px solid #ff4d6d30",
    color: "#ff8099",
    borderRadius: "10px",
    padding: "0.8rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
  },
};

// Show hamburger on mobile via CSS
const style = document.createElement("style");
style.textContent = `
  @media(min-width:769px){.nav-hamburger{display:none!important}}
  @media(max-width:768px){.nav-desktop-links{display:none!important}.nav-desktop-right{display:none!important}.nav-hamburger{display:flex!important}}
`;
document.head.appendChild(style);

export default Navbar;
