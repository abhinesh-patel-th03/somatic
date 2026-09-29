import client from "./client";

export const getCows = async (params = {}) => {
  const { data } = await client.get("/cows", { params });
  return data.data;
};

export const getCow = async (id) => {
  const { data } = await client.get(`/cows/${id}`);
  return data.data;
};

export const createCow = async (payload) => {
  const { data } = await client.post("/cows", payload);
  return data.data;
};

export const updateCow = async (id, payload) => {
  const { data } = await client.put(`/cows/${id}`, payload);
  return data.data;
};

export const deleteCow = async (id) => {
  const { data } = await client.delete(`/cows/${id}`);
  return data.data;
};