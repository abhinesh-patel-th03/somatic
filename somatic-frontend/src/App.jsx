import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cows from "./pages/Cows";
import CowDetails from "./pages/CowDetails";
import NewTest from "./pages/NewTest";
import TestProgress from "./pages/TestProgress";
import TestResult from "./pages/TestResult";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import React from "react";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cows" element={<Cows />} />
          <Route path="/cows/:id" element={<CowDetails />} />
          <Route path="/tests/new/:cowId" element={<NewTest />} />
          <Route path="/tests/:testId/progress" element={<TestProgress />} />
          <Route path="/tests/:testId/result" element={<TestResult />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}