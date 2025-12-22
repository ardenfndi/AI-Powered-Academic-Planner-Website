import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

type Props = {
  onLogin: () => void;
  onSwitchToRegister: () => void;
};

const emailPattern = /\S+@\S+\.\S+/;

export default function LoginPage({ onLogin, onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
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
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button className="secondary-btn" type="button" onClick={onSwitchToRegister}>
              Register
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
