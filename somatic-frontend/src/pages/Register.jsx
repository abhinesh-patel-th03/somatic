import React from "react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorBox from "../components/ErrorBox";
import { STATES, getDistricts } from "../data/indiaStatesDistricts";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({name: "", email: "", phone: "", password: "", farmName: "",state: "", district: ""});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const districts = useMemo(() => getDistricts(form.state), [form.state]);

  const onStateChange = (e) => {
    setForm({ ...form, state: e.target.value, district: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUp(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand auth-brand"><div className="brand-mark">S</div><div><strong>SOMATIC</strong><span>Clinical Field System</span></div></div>
        <h1>Create farmer account</h1>
        <p className="auth-subtitle">Register your farm to begin milk-health assessments.</p>
        <form onSubmit={submit} className="form">
          <ErrorBox message={error} />
          <label>Name<input required minLength={2} value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></label>

          <label>
            State
            <select required value={form.state} onChange={onStateChange}>
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            District
            <select
              required
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              disabled={!form.state}
            >
              <option value="">{form.state ? "Select district" : "Select state first"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></label>
          <label>Phone<input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></label>
          <label>Farm name<input value={form.farmName} onChange={e => setForm({...form, farmName:e.target.value})} /></label>

          <label>Password<input required minLength={8} type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} /></label>
          <button className="primary-btn" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
          <p className="form-note">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}