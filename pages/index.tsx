import React from "react";

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Página de Notícias de Negócios</h1>
      <h2 style={styles.subHeading}>Em construção</h2>
    </div>
  );
}

interface Styles {
  container: React.CSSProperties;
  heading: React.CSSProperties;
  subHeading: React.CSSProperties;
}

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f3f4f6",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  subHeading: {
    fontSize: "1.5rem",
    color: "#6b7280",
  },
};

export default Home;
