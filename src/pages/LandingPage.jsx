export default function LandingPage({ irParaAuth }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hangr</h1>
      <p style={styles.text}>
        O app que junta amigos e sugere um rolê que todo mundo aceita.
      </p>

      <button style={styles.button} onClick={irParaAuth}>
        Começar
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f0f12",
    color: "#fff",
    padding: "24px",
    textAlign: "center",
  },
  title: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  text: {
    maxWidth: "420px",
    lineHeight: 1.5,
    marginBottom: "24px",
    color: "#c9c9d1",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "#8b5cf6",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};