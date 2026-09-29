import client from "./client";

export const getQuestions = async () => {
  const { data } = await client.get("/observations/questions");
  return data.data;
};