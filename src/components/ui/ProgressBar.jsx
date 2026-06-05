const ProgressBar = ({ percent = 0 }) => {
  return (
    <div style={styles.track}>
      <div style={{ ...styles.fill, width: `${percent}%` }} />
      <span style={styles.label}>{percent}%</span>
    </div>
  );
};

const styles = {
  track: {
    position: "relative",
    backgroundColor: "#e0e0e0",
    borderRadius: "99px",
    height: "12px",
    overflow: "hidden",
    marginTop: "0.5rem",
  },
  fill: {
    height: "100%",
    backgroundColor: "#00d4aa",
    borderRadius: "99px",
    transition: "width 0.4s ease",
  },
  label: {
    position: "absolute",
    right: "8px",
    top: "-1px",
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#333",
  },
};

export default ProgressBar;
