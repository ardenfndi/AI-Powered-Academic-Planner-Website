import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

type Props = {
  onRegister: () => void;
  onSwitchToLogin: () => void;
};

const emailPattern = /\S+@\S+\.\S+/;

export default function RegisterPage({ onRegister, onSwitchToLogin }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
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
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
            <button className="secondary-btn" type="button" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
