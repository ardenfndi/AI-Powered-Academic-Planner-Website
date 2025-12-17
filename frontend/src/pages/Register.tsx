import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage({ onRegister }: { onRegister: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      onRegister();
    } catch (err: any) {
      setError(err?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">Register</h1>
          <p className="planner-subtitle">Create an account to save schedules.</p>
        </div>
      </header>

      <section className="panel-card panel-wide">
        <form onSubmit={submit} className="panel-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="muted" style={{ color: "#f87171" }}>{error}</div>}
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>Create account</button>
            <button className="secondary-btn" type="button" onClick={() => (window.location.hash = "#login")}>Sign in</button>
          </div>
        </form>
      </section>
    </main>
  );
}
