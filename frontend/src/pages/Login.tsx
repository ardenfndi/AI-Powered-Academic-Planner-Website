import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">Login</h1>
          <p className="planner-subtitle">Sign in with your email and password.</p>
        </div>
      </header>

      <section className="panel-card panel-wide">
        <form onSubmit={submit} className="panel-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="muted" style={{ color: "#f87171" }}>{error}</div>}
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>Sign in</button>
            <button className="secondary-btn" type="button" onClick={() => (window.location.hash = "#register")}>Register</button>
          </div>
        </form>
      </section>
    </main>
  );
}
