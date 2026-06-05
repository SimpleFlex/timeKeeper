const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  style = {},
}) => {
  return (
    <div style={styles.wrapper}>
      {label && <label style={styles.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
          ...style,
        }}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    marginBottom: "1rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border 0.2s",
    backgroundColor: "#fff",
  },
  inputError: {
    border: "1px solid #e74c3c",
  },
  error: {
    fontSize: "0.8rem",
    color: "#e74c3c",
  },
};

export default Input;
