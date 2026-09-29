import axios from "axios";

export const getBackendHealth = async () => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const origin = base.replace(/\/api\/?$/, "");
  const { data } = await axios.get(`${origin}/health`);
  return data.data;
};