import client from "./client";

export const register = async (payload) => {
  const { data } = await client.post("/auth/register", payload);
  return data.data;
};

export const login = async (payload) => {
  const { data } = await client.post("/auth/login", payload);
  return data.data;
};

export const logout = async () => {
  const { data } = await client.post("/auth/logout");
  return data.data;
};

export const getMe = async () => {
  const { data } = await client.get("/auth/me");
  return data.data;
};