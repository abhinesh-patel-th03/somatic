import client from "./client";

export const startTest = async (cowId) => {
  const { data } = await client.post("/tests/start", { cowId });
  return data.data;
};

export const submitObservations = async (testId, answers) => {
  const { data } = await client.post(
    `/tests/${testId}/observations`,
    { answers }
  );
  return data.data;
};

export const startSensorTest = async (testId) => {
  const { data } = await client.post(
    `/tests/${testId}/start-sensor`
  );
  return data.data;
};

export const getTestStatus = async (testId) => {
  const { data } = await client.get(
    `/tests/${testId}/status`
  );
  return data.data;
};

export const getTestResult = async (testId) => {
  const { data } = await client.get(
    `/tests/${testId}/result`
  );
  return data.data;
};

export const getCowTestHistory = async (cowId) => {
  const { data } = await client.get(
    `/tests/cow/${cowId}/history`
  );
  return data.data;
};