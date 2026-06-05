const Card = ({ children, style = {} }) => {
  return <div style={{ ...styles.card, ...style }}>{children}</div>;
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    marginBottom: "1rem",
  },
};

export default Card;
