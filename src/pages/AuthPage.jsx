export default function AuthPage({ voltar }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login / Signup</h1>
      <p style={styles.text}>
        Aqui depois vamos ligar com o backend.
      </p>

      <input style={styles.input} placeholder="Seu nome" />
      <input style={styles.input} placeholder="Seu email" />

      <button style={styles.button}>Entrar</button>

      <button style={styles.backButton} onClick={voltar}>
        Voltar
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
    gap: "12px",
  },
  title: {
    fontSize: "40px",
    marginBottom: "8px",
  },
  text: {
    maxWidth: "420px",
    color: "#c9c9d1",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    maxWidth: "320px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #333",
    background: "#1a1a1f",
    color: "#fff",
  },
  button: {
    marginTop: "8px",
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "#8b5cf6",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  backButton: {
    marginTop: "8px",
    background: "transparent",
    border: "none",
    color: "#c9c9d1",
    cursor: "pointer",
  },
};