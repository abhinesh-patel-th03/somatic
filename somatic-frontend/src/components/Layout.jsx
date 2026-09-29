import React from "react";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, PawPrint, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import cowLogo from "../assets/cow-logo.png";

export default function Layout() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src={cowLogo} alt="SOMATIC" className="brand-logo" />
          <div>
            <strong>SOMATIC</strong>
            <span>Clinical Field System</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard">
            <LayoutDashboard size={18} /> {t("dashboard")}
          </NavLink>

          <NavLink to="/cows">
            <PawPrint size={18} /> {t("myCows")}
          </NavLink>

          <NavLink to="/profile">
            <UserRound size={18} /> {t("profile")}
          </NavLink>

          <LanguageSelector />
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">{user?.name?.[0]?.toUpperCase() || "F"}</div>
            <div>
              <strong>{user?.name || "Farmer"}</strong>
              <span>{user?.farmName || "Farm"}</span>
            </div>
          </div>
          <button className="ghost-btn" onClick={logout}><LogOut size={17} /> {t("logout")}</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
