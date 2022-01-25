import { Db, MongoClient } from "mongodb";
import logger from "../../util/logger";

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;
const uri = `mongodb+srv://${db_username}:${db_password}@backend-cluster.ffmyh.mongodb.net/${db_name}?retryWrites=true&w=majority`;

export let db: Db;

export const connectDB = async () => {
  try {
    MongoClient.connect(uri, { retryWrites: true }, (err, client) => {
      if (err) {
        throw err;
      }
      if (client) {
        db = client.db(db_name);
      }
    });
  } catch (error) {
    logger.warn(error);
  }
};
