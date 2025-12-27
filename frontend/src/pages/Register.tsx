import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";

type Props = {
  onRegister: () => void;
  onSwitchToLogin: () => void;
};

const emailPattern = /\S+@\S+\.\S+/;

export default function RegisterPage({ onRegister, onSwitchToLogin }: Props) {
  const { register } = useAuth();
  const language = usePreferences((s) => s.language);
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
      setError(t(language, "auth.errors.nameRequired"));
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError(t(language, "auth.errors.emailInvalid"));
      return;
    }

    if (password.trim().length < 8) {
      setError(t(language, "auth.errors.passwordLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t(language, "auth.errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      onRegister();
    } catch (err: any) {
      setError(err?.message || t(language, "auth.errors.registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "auth.registerTitle")}</h1>
          <p className="planner-subtitle">{t(language, "auth.registerSubtitle")}</p>
        </div>
      </header>

      <section className="panel-card panel-wide">
        <form onSubmit={submit} className="panel-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="muted" style={{ color: "#f87171" }}>{error}</div>}
          <input
            placeholder={t(language, "auth.placeholder.fullName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder={t(language, "auth.placeholder.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder={t(language, "auth.placeholder.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            placeholder={t(language, "auth.placeholder.confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? t(language, "auth.creating") : t(language, "auth.createAccount")}
            </button>
            <button className="secondary-btn" type="button" onClick={onSwitchToLogin}>
              {t(language, "auth.signIn")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
