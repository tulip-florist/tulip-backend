import { ObjectId } from "mongodb";
import { Request } from "express";
import { Document as MongoDoc } from "mongodb";

export interface User {
  id: ObjectId;
  auth: {
    token?: TokenAuth;
    email?: EmailAuth;
  };
}

interface TokenAuth {
  token: number;
}

interface EmailAuth {
  email: string;
  password: string;
}

export interface Session {
  accessToken: string;
}

export interface AuthRequest extends Request {
  user?: MongoDoc;
  // headers: IncomingHttpHeaders & {
  //   "custom-header"?: string;
  // };
}
