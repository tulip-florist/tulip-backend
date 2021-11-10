import { DbClient } from "../../database/database";
import bcrypt from "bcrypt";
import { Session, User } from "../../types/types";
import { ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";

export const jwtAlgorithm: jwt.Algorithm = "HS512";

export const createEmailUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const newUser = await createUser();
    const emailUser: User = await linkUserEmailAuth(
      newUser.id,
      email,
      password
    );
    return emailUser;
  } catch (error) {
    console.log((error as Error).message);
    throw error;
  }
};

export const signEmailUserIn = async (
  email: string,
  password: string
): Promise<Session> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const user = await users.findOne({ "auth.email.email": email });
  if (!user) throw new Error("User not found.");

  let passwordIsValid = bcrypt.compareSync(password, user.auth.email.password);
  if (!passwordIsValid) throw new Error("Invalid Password.");

  const token = signUserToken(user._id);
  const resp: Session = {
    accessToken: token,
  };
  return resp;
};

export const signUserToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) throw new Error("Backend JWT_SECRET missing");

  const issued = Date.now();
  const fifteenMinutesInMs = 15 * 60 * 1000;
  const expires = issued + fifteenMinutesInMs;

  const token = jwt.sign(
    { id: userId, issued, expires },
    process.env.JWT_SECRET,
    {
      algorithm: jwtAlgorithm,
      expiresIn: expires,
    }
  );
  return token;
};

export const checkExpirationStatus = (token: JwtPayload) => {
  const now = Date.now();
  if (token.expires) {
    if (token.expires > now) return "valid";
    const oneHourInMs = 1 * 60 * 60 * 1000;
    const oneHourAfterExpiration = token.expires + oneHourInMs;
    if (oneHourAfterExpiration > now) {
      return "renew";
    }
  }
  return "expired";
};

const createUser = async (): Promise<Omit<User, "auth">> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  try {
    const insertResult = await users.insertOne({});
    const user: Omit<User, "auth"> = {
      id: insertResult.insertedId,
    };
    return user;
  } catch (error) {
    throw new Error("Could not create user");
  }
};

const linkUserEmailAuth = async (
  userId: ObjectId,
  email: string,
  password: string
): Promise<User> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const user: User = {
    id: userId,
    auth: {
      email: {
        email,
        password: bcrypt.hashSync(password, 8),
      },
    },
  };

  const updateResult = await users.updateOne(
    { _id: userId },
    { $set: { auth: user.auth } }
  );
  if (updateResult.modifiedCount === 1) {
    return user;
  } else {
    throw new Error("Could link userEmailAuth");
  }
};
