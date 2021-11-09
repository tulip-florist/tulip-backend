import { DbClient } from "../../database/database";

export const createUser = async () => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");
  const createdUser = await users.insertOne({ name: "Max" });
  return createdUser;
};
