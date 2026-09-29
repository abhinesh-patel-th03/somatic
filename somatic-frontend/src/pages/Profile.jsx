import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("profile")}
        subtitle={t("authenticatedFarmerAccount")}
      />

      <section className="panel profile-panel">
        <div className="avatar large">
          {user?.name?.[0]?.toUpperCase()}
        </div>

        <div className="info-list">
          <div>
            <span>{t("name")}</span>
            <strong>{user?.name}</strong>
          </div>

          <div>
            <span>{t("email")}</span>
            <strong>{user?.email}</strong>
          </div>

          <div>
            <span>{t("phone")}</span>
            <strong>{user?.phone || "—"}</strong>
          </div>

          <div>
            <span>{t("farm")}</span>
            <strong>{user?.farmName || "—"}</strong>
          </div>
          <div>
            <span>State</span>
            <strong>{user?.state || "—"}</strong>
          </div>

          <div>
            <span>District</span>
            <strong>{user?.district || "—"}</strong>
          </div>

          <div>
            <span>{t("role")}</span>
            <strong>{user?.role}</strong>
          </div>
        </div>
      </section>
    </>
  );
}