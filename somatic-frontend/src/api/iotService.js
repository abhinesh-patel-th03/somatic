import client from "./client";

/*
 * This is the frontend relay for Bluetooth/IoT telemetry.
 * Payload must match backend iotValidator exactly:
 * {
 *   testId, cowId, deviceId, timestamp,
 *   measurements: { ph, temperature, conductivity }
 * }
 *
 * NOTE: `client` (see api/client.js) already has "/api" baked into its
 * baseURL, the same way every other service in this app calls it
 * (e.g. testService uses "/tests/start", not "/api/tests/start").
 * So the path here must NOT repeat "/api" or it becomes "/api/api/...".
 */
export const sendSensorData = async (payload) => {
  const { data } = await client.post("/iot/sensor-data", payload);
  return data.data;
};

/*
 * DEMO ONLY — no real hardware attached.
 * Hits the same endpoint with ?demo=<level>; the backend fills in a
 * synthetic ph / temperature / conductivity reading for that risk level
 * and runs it through the real pipeline for whichever test is currently
 * WAITING_FOR_DEVICE.
 *
 * level: "low" | "medium" | "high" | "very_high"
 */
export const sendDemoSensorReading = async (level) => {
  const { data } = await client.post(
    "/iot/sensor-data",
    {},
    { params: { demo: level } }
  );
  return data.data;
};