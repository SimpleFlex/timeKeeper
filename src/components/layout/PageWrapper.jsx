import Navbar from "./Navbar";

const PageWrapper = ({ children }) => {
  return (
    <div style={s.wrapper}>
      <Navbar />
      <main style={s.main}>{children}</main>
    </div>
  );
};

const s = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "var(--black)",
    backgroundImage:
      "radial-gradient(ellipse at 20% 50%, #c6f13508 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #00e5cc06 0%, transparent 60%)",
  },
  main: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
  },
};

export default PageWrapper;
