import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw, AlertTriangle, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import RiskTrajectoryPanel from "../components/RiskTrajectoryPanel";
import HygieneImageModal, { getFarmPhotoText } from "../components/HygieneImageModal";
import { getCows } from "../api/cowService";
import { getFarmHealth } from "../api/farmService";

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  const [health, setHealth] = useState(null);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHygiene, setShowHygiene] = useState(true); // opens automatically on dashboard load

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [farm, cowData] = await Promise.all([
        getFarmHealth(),
        getCows({ active: "true" }),
      ]);

      setHealth(farm);
      setCows(cowData.cows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <Loading text={t("loadingFarmHealth")} />;
  }

  return (
    <>
      <PageHeader
        title={t("farmDashboard")}
        subtitle={t("dashboardSubtitle")}
        action={
          <div className="header-actions">
            <button
              className="secondary-btn"
              onClick={() => setShowHygiene(true)}
            >
              <Camera size={16} />
              {getFarmPhotoText(i18n.language).title}
            </button>

            <button
              className="secondary-btn"
              onClick={load}
            >
              <RefreshCw size={16} />
              {t("refresh")}
            </button>

            <Link
              className="primary-btn inline-btn"
              to="/cows"
            >
              <Plus size={16} />
              {t("manageCows")}
            </Link>
          </div>
        }
      />

      <ErrorBox message={error} />

      <section className="stats-grid">
        <StatCard
          label={t("totalCows")}
          value={health?.overview?.totalCows}
        />

        <StatCard
          label={t("activeCows")}
          value={health?.overview?.activeCows}
        />

        <StatCard
          label={t("attentionRequired")}
          value={health?.overview?.cowsRequiringAttention}
          danger
        />

        <StatCard
          label={t("avgRiskScore")}
          value={health?.overview?.averageRiskScore}
          hint={t("last30Days")}
        />

        <StatCard
          label={t("tests")}
          value={health?.overview?.totalTests30Days}
          hint={t("last30Days")}
        />
      </section>

      {/* 20-Day Mastitis Risk Score Trajectory */}
      <RiskTrajectoryPanel />

      <div className="content-grid">

        
      </div>

      {/* Add Farm Photo and Cattle Feed (demo popup, nothing is stored) */}
      <HygieneImageModal
        open={showHygiene}
        onClose={() => setShowHygiene(false)}
      />
    </>
  );
}
