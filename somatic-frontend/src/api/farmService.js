import client from "./client";

// Backend route exists in src/routes/farmRoutes.js.
// Note: current src/app.js does NOT mount /api/farm.
export const getFarmHealth = async () => {
  const { data } = await client.get("/farm/health");
  return data.data;
};