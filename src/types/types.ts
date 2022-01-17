import { ObjectId, Document as MongoDoc } from "mongodb";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

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
  refreshToken: string;
  userId: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  // headers: IncomingHttpHeaders & {
  //   "custom-header"?: string;
  // };
}

export const ACCESS_TOKEN: string = "access_token";
export const REFRESH_TOKEN: string = "refresh_token";

export interface RefreshTokenDB extends MongoDoc {
  userId: ObjectId;
  refreshToken: string;
  valid: boolean;
  iat: number;
  exp: Date;
}

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
}
