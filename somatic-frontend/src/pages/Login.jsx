import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorBox from "../components/ErrorBox";
import { useTranslation } from "react-i18next";
import { LANGUAGES, normalizeLang } from "../i18n/languages";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await signIn(form);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title={t("welcomeBack")}
      subtitle={t("loginSubtitle")}
    >
      <form onSubmit={submit} className="form">
        <ErrorBox message={error} />

        {/* Language Selection */}
        <label>
          {t("language")}
          <select
            className="language-select"
            value={normalizeLang(i18n.language)}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("email")}
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </label>

        <label>
          {t("password")}
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </label>

        <button className="primary-btn" disabled={busy}>
          {busy ? t("signingIn") : t("signIn")}
        </button>

        {/* Demo credentials hint */}
        <div className="demo-credentials">
          <p>
            <strong>Demo Login:</strong>
          </p>
          <p>
            Admin → Email: <code>admin@demo.com</code>, Password:{" "}
            <code>demo1234</code>
          </p>
        </div>

        <p className="form-note">
          {t("newFarmer")}{" "}
          <Link to="/register">{t("createAccount")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SOMATIC</strong>
            <span>Clinical Field System</span>
          </div>
        </div>

        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {children}
      </div>
    </div>
  );
}