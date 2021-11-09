import { MongoClient, MongoClientOptions } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;
const uri = `mongodb+srv://${db_username}:${db_password}@backend-cluster.ffmyh.mongodb.net/${db_name}?retryWrites=true&w=majority`;

export class DbClient {
  private static client: null | MongoClient = null;

  private constructor() {}

  public static async getInstance(): Promise<MongoClient> {
    if (DbClient.client) return DbClient.client;

    DbClient.client = await new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as MongoClientOptions).connect();
    return DbClient.client;
  }
}
