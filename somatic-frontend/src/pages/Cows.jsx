import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/PageHeader";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import { createCow, getCows } from "../api/cowService";

const empty = {
  cowId: "",
  name: "",
  breed: "",
  age: "",
  lactationNumber: "",
  lactationCycle: "",
  penNumber: "",
};

export default function Cows() {
  const { t, i18n } = useTranslation();
  

  const [cows, setCows] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      const data = await getCows(search ? { search } : {});
      setCows(data.cows || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createCow({
        ...form,
        age: form.age === "" ? undefined : Number(form.age),
        lactationNumber:
          form.lactationNumber === ""
            ? undefined
            : Number(form.lactationNumber),
        lactationCycle:
          form.lactationCycle === ""
            ? undefined
            : Number(form.lactationCycle),
      });

      setForm(empty);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Translate risk level coming from backend
  const getRiskLabel = (level) => {
    const normalized = String(level || "UNTESTED").toUpperCase();

    const riskTranslations = {
      LOW: "riskLow",
      MEDIUM: "riskMedium",
      HIGH: "riskHigh",
      CRITICAL: "riskCritical",
      UNTESTED: "untested",
    };

    return t(riskTranslations[normalized] || "untested");
  };

  return (
    <>
      <PageHeader
        title={t("myCows")}
        subtitle={t("cowsSubtitle")}
        action={
          <button
            className="primary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} />
            {t("registerCow")}
          </button>
        }
      />

      <ErrorBox message={error} />

      {/* Register Cow Form */}
      {showForm && (
        <form
          className="panel form-panel"
          onSubmit={submit}
        >
          <h2>{t("registerACow")}</h2>

          <div className="form-grid">
            {[
              ["cowId", "cowId", true],
              ["name", "name", true],
              ["breed", "breed"],
              ["age", "age", "number"],
              [
                "lactationNumber",
                "lactationNumber",
                "number",
              ],
              [
                "lactationCycle",
                "lactationCycle",
                "number",
              ],
              ["penNumber", "penNumber"],
            ].map(([key, label, kind]) => (
              <label key={key}>
                {t(label)}

                <input
                  required={kind === true}
                  type={
                    kind === "number"
                      ? "number"
                      : "text"
                  }
                  min={
                    kind === "number"
                      ? 0
                      : undefined
                  }
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                />
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowForm(false)}
            >
              {t("cancel")}
            </button>

            <button
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? t("saving")
                : t("saveCow")}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="search-box">
        <Search size={17} />

        <input
          placeholder={t("searchCow")}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Cow List */}
      {loading ? (
        <Loading text={t("loadingCows")} />
      ) : cows.length === 0 ? (
        <div className="empty panel">
          {t("noCowsFound")}
        </div>
      ) : (
        <div className="cow-grid">
          {cows.map((cow) => {
            const riskLevel =
              cow.currentRiskLevel ||
              "UNTESTED";

            return (
              <Link
                className="cow-card"
                to={`/cows/${cow._id}`}
                key={cow._id}
              >
                <div className="cow-card-top">
                  <div className="cow-avatar">
                    C
                  </div>

                  <span
                    className={`risk-pill ${String(
                      riskLevel
                    ).toLowerCase()}`}
                  >
                    {getRiskLabel(riskLevel)}
                  </span>
                </div>

                <h2>{cow.name}</h2>

                <p>
                  {cow.cowId} ·{" "}
                  {cow.breed ||
                    t("breedNotSet")}
                </p>

                <div className="cow-meta">
                  <span>
                    {t("age")}{" "}
                    {cow.age ?? "—"}
                  </span>

                  <span>
                    {t("pen")}{" "}
                    {cow.penNumber || "—"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}