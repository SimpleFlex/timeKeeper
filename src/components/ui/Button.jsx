const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  style = {},
}) => {
  const base = {
    padding: "0.6rem 1.4rem",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s",
    ...style,
  };

  const variants = {
    primary: { backgroundColor: "#00d4aa", color: "#fff" },
    danger: { backgroundColor: "#e74c3c", color: "#fff" },
    outline: {
      backgroundColor: "transparent",
      color: "#00d4aa",
      border: "2px solid #00d4aa",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#555",
      border: "1px solid #ddd",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

export default Button;
