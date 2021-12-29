import { ObjectId } from "mongodb";
import { Request } from "express";

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

export interface Document {
  id: ObjectId;
  userId: ObjectId;
  documentHash: string;
  annotations: Array<Annotation>;
}

export interface Annotation {
  id: string;
  color: string;
  highlight: string;
  note?: string;
  position: any;
}

export interface Session {
  accessToken: string;
  userId: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  // headers: IncomingHttpHeaders & {
  //   "custom-header"?: string;
  // };
}
