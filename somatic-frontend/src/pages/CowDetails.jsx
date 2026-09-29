import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Play,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/PageHeader";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";

import {
  deleteCow,
  getCow,
  updateCow,
} from "../api/cowService";

import { getCowTestHistory } from "../api/testService";

export default function CowDetails() {
  const { t } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();

  const [cow, setCow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  // Historical test data
  const [testHistory, setTestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const chartData = testHistory.map((test) => ({
  date: test.date
    ? new Date(test.date).toLocaleDateString()
    : "—",
  riskScore: test.riskScore ?? 0,
}));

  useEffect(() => {
    const loadCowData = async () => {
      try {
        // Load cow details
        const { cow } = await getCow(id);

        setCow(cow);
        setForm(cow);

        // Load previous completed tests
        const historyData = await getCowTestHistory(id);

        setTestHistory(historyData.history || []);

        // Temporary debugging
        console.log("Test history:", historyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadCowData();
  }, [id]);

  if (error && !cow) {
    return <ErrorBox message={error} />;
  }

  if (!cow) {
    return <Loading text={t("loadingCow")} />;
  }

  const save = async (e) => {
    e.preventDefault();

    try {
      const { cow: updated } = await updateCow(id, {
        name: form.name,
        breed: form.breed,
        age: Number(form.age),
        lactationNumber: Number(form.lactationNumber),
        lactationCycle: Number(form.lactationCycle),
        penNumber: form.penNumber,
        active: form.active,
      });

      setCow(updated);
      setForm(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!confirm(`${t("delete")} ${cow.name}?`)) {
      return;
    }

    try {
      await deleteCow(id);
      navigate("/cows");
    } catch (err) {
      setError(err.message);
    }
  };

  const getRiskLabel = (level) => {
    const normalized = String(
      level || "UNTESTED"
    ).toUpperCase();

    const riskTranslations = {
      LOW: "riskLow",
      MEDIUM: "riskMedium",
      HIGH: "riskHigh",
      CRITICAL: "riskCritical",
      UNTESTED: "untested",
    };

    return t(
      riskTranslations[normalized] || "untested"
    );
  };

  const getStatusLabel = (active) => {
    return active ? t("active") : t("inactive");
  };

  return (
    <>
      <PageHeader
        title={cow.name}
        subtitle={`${cow.cowId} · ${
          cow.breed || t("breedNotSet")
        }`}
        action={
          <Link
            className="secondary-btn inline-btn"
            to="/cows"
          >
            <ArrowLeft size={16} />
            {t("back")}
          </Link>
        }
      />

      <ErrorBox message={error} />

      <div className="detail-grid">

        {/* =========================
            Cow Profile
        ========================== */}
        <section className="panel">
          <div className="panel-head">
            <h2>{t("cowProfile")}</h2>

            <div className="header-actions">
              <button
                className="secondary-btn"
                onClick={() => setEditing(!editing)}
              >
                <Pencil size={15} />
                {t("edit")}
              </button>

              <button
                className="danger-btn"
                onClick={remove}
                title={t("delete")}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {editing ? (
            <form
              className="form"
              onSubmit={save}
            >
              {[
                "name",
                "breed",
                "age",
                "lactationNumber",
                "lactationCycle",
                "penNumber",
              ].map((key) => (
                <label key={key}>
                  {t(key)}

                  <input
                    value={form[key] ?? ""}
                    type={
                      [
                        "age",
                        "lactationNumber",
                        "lactationCycle",
                      ].includes(key)
                        ? "number"
                        : "text"
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                  />
                </label>
              ))}

              <button className="primary-btn">
                {t("saveChanges")}
              </button>
            </form>
          ) : (
            <div className="info-list">
              <div>
                <span>{t("age")}</span>
                <strong>
                  {cow.age ?? "—"}
                </strong>
              </div>

              <div>
                <span>{t("lactationNumber")}</span>
                <strong>
                  {cow.lactationNumber ?? "—"}
                </strong>
              </div>

              <div>
                <span>{t("lactationCycle")}</span>
                <strong>
                  {cow.lactationCycle ?? "—"}
                </strong>
              </div>

              <div>
                <span>{t("pen")}</span>
                <strong>
                  {cow.penNumber || "—"}
                </strong>
              </div>

              <div>
                <span>{t("status")}</span>
                <strong>
                  {getStatusLabel(cow.active)}
                </strong>
              </div>
            </div>
          )}
        </section>


        {/* =========================
            Current Assessment
        ========================== */}
        <section className="panel highlight-panel">
          <span className="eyebrow">
            {t("currentAssessment")}
          </span>

          <div
            className={`big-risk ${String(
              cow.currentRiskLevel || "UNTESTED"
            ).toLowerCase()}`}
          >
            {cow.currentRiskScore ?? "—"}
            {cow.currentRiskScore != null && "%"}
          </div>

          <strong>
            {getRiskLabel(cow.currentRiskLevel)}
          </strong>

          <p>
            {cow.lastTestDate
              ? `${t("lastTest")}: ${new Date(
                  cow.lastTestDate
                ).toLocaleString()}`
              : t("notAssessedYet")}
          </p>

          <Link
            className="primary-btn inline-btn"
            to={`/tests/new/${cow._id}`}
          >
            <Play size={16} />
            {t("startMilkTest")}
          </Link>
        </section>


        {/* =========================
    Test History
========================== */}
<section className="panel history-panel">
  <div className="panel-head">
    <div>
      <span className="eyebrow">
        {t("testHistory")}
      </span>

      <h2>
        {t("previousAssessments")}
      </h2>
    </div>

    <strong>
      {testHistory.length}{" "}
      {testHistory.length === 1
        ? t("test")
        : t("tests")}
    </strong>
  </div>

  {historyLoading ? (
    <Loading text={t("loadingTestHistory")} />
  ) : testHistory.length === 0 ? (
    <p className="muted">
      {t("noCompletedTests")}
    </p>
  ) : (
    <>
      {/* =========================
          Risk Trend Graph
      ========================== */}
      <div className="history-chart">
        <div className="history-chart-header">
          <div>
            <strong>Risk Score Trend</strong>
            <span>
              Historical risk assessment
            </span>
          </div>
        </div>

        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 15,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                `${value}%`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${value}%`,
                "Risk Score",
              ]}
            />

            <Line
              type="monotone"
              dataKey="riskScore"
              stroke="#182234"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =========================
          Historical Records
      ========================== */}
      <div className="history-list">
        {testHistory.map((test) => (
          <div
            className="history-item"
            key={test.testId}
          >
            {/* Test information */}
            <div className="history-test-info">
              <strong>
                {test.testId}
              </strong>

              <span>
                {test.date
                  ? new Date(
                      test.date
                    ).toLocaleString()
                  : "—"}
              </span>
            </div>

            {/* Risk */}
            <div className="history-risk">
              <strong>
                {test.riskScore ?? "—"}%
              </strong>

              <span
                className={`risk-badge ${String(
                  test.riskLevel ||
                    "UNTESTED"
                ).toLowerCase()}`}
              >
                {getRiskLabel(
                  test.riskLevel
                )}
              </span>
            </div>

            {/* Sensors */}
            <div className="history-sensors">
              <div>
                <span>pH</span>

                <strong>
                  {test.sensors?.ph ?? "—"}
                </strong>
              </div>

              <div>
                <span>
                  {t("temperature")}
                </span>

                <strong>
                  {test.sensors
                    ?.temperature != null
                    ? `${test.sensors.temperature}°C`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  {t("conductivity")}
                </span>

                <strong>
                  {test.sensors
                    ?.conductivity ?? "—"}
                </strong>
              </div>
            </div>

            {/* Observations */}
            <div className="history-observations">
              <span>
                {t("observations")}
              </span>

              <strong>
                {test.observations
                  ?.positiveFlags ?? 0}
                /
                {test.observations?.total ??
                  0}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</section>
      </div>
    </>
  );
}