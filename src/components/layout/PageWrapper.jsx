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
      "radial-gradient(ellipse at 20% 50%, #d4f24408 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #00f0d406 0%, transparent 60%)",
  },
  main: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "clamp(1.2rem, 4vw, 2.5rem) clamp(1rem, 4vw, 1.5rem)",
  },
};

export default PageWrapper;
