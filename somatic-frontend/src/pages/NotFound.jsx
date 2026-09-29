import React from "react";
import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="screen-center"><h1>404</h1><p>Page not found.</p><Link className="primary-btn inline-btn" to="/dashboard">Dashboard</Link></div>;
}