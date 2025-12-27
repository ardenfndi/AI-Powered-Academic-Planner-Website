import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";

type Props = {
  onLogin: () => void;
  onSwitchToRegister: () => void;
};

const emailPattern = /\S+@\S+\.\S+/;

export default function LoginPage({ onLogin, onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const language = usePreferences((s) => s.language);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!emailPattern.test(email.trim())) {
      setError(t(language, "auth.errors.emailInvalid"));
      return;
    }

    if (password.trim().length < 8) {
      setError(t(language, "auth.errors.passwordLength"));
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      onLogin();
    } catch (err: any) {
      setError(err?.message || t(language, "auth.errors.loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="planner-main">
      <header className="planner-header">
        <div>
          <h1 className="planner-title">{t(language, "auth.loginTitle")}</h1>
          <p className="planner-subtitle">{t(language, "auth.loginSubtitle")}</p>
        </div>
      </header>

      <section className="panel-card panel-wide">
        <form onSubmit={submit} className="panel-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="muted" style={{ color: "#f87171" }}>{error}</div>}
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
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? t(language, "auth.signing") : t(language, "auth.signIn")}
            </button>
            <button className="secondary-btn" type="button" onClick={onSwitchToRegister}>
              {t(language, "auth.createAccount")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
