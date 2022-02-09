import bcrypt from "bcrypt";
import argon2 from "argon2";
import {
  RefreshTokenDB,
  RefreshTokenPayload,
  Session,
  User,
} from "../../types/types";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { CustomError } from "../../errors/CustomError";
import { inXMinutes } from "../../util/datesHelper";
import {
  EmailAlreadyUsedError,
  InvalidLoginCredentials,
  RefreshTokenExpiredError,
  RefreshTokenInvalidError,
  RefreshTokenReusedError,
} from "../../errors/authErrors";
import Logger from "../../util/logger";
import { db } from "../database/database";
import logger from "../../util/logger";

export const jwtAlgorithm: jwt.Algorithm = "HS512";
export const ACCESS_TOKEN_EXPIRATION = 600; // in seconds (= 10m)
export const REFRESH_TOKEN_EXPIRATION = 86400; // in seconds (= 1d)

export const createEmailUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const emailExists = await emailExisting(email);
  if (emailExists) throw new EmailAlreadyUsedError();

  const createdUser = await createUser();
  try {
    const emailUser: User = await linkUserEmailAuth(
      createdUser.id,
      email,
      password
    );

    logger.info("Register: " + email);
    return emailUser;
  } catch (error) {
    await deleteUser(createdUser.id);
    throw error;
  }
};

export const signEmailUserIn = async (
  email: string,
  password: string
): Promise<Session> => {
  const users = db.collection("users");
  const user = await users.findOne({ "auth.email.email": email });

  if (!user) throw new InvalidLoginCredentials();

  const dbPassword: string = user.auth.email.password;

  // migrating from bcrypt to argon2
  if (dbPassword.indexOf("$argon2") === 0) {
    // argon2
    const match = await argon2.verify(dbPassword, password, {
      type: argon2.argon2id,
      parallelism: 2,
      memoryCost: 15360,
      timeCost: 4,
    });

    if (!match) {
      throw new InvalidLoginCredentials();
    }
  } else {
    // bcrypt
    const match = await bcrypt.compare(password, dbPassword);
    if (!match) {
      throw new InvalidLoginCredentials();
    }

    // migrate to argon2
    const argon2Hash = await argon2.hash(password);
    await users.updateOne(
      { _id: user._id },
      { $set: { "auth.email.password": argon2Hash } }
    );
  }

  logger.info("Login: " + email);

  if (isCanaryAccount(email)) {
    logger.warn(
      "Detected successful canary account login attempt. Email: " + email
    );
    process.exit();
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  const session: Session = {
    accessToken,
    refreshToken,
    userId: user._id.toString(),
  };
  return session;
};

export const logout = async (refreshToken: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

  let userId: string;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
      algorithms: [jwtAlgorithm],
    }) as RefreshTokenPayload;
    userId = decoded.userId;
  } catch (error) {
    const err = error as Error;
    if (err && err.name === "JsonWebTokenError") {
      throw new RefreshTokenInvalidError();
    } else if (err && err.name === "TokenExpiredError") {
      const payload = jwt.decode(refreshToken) as RefreshTokenPayload;
      userId = payload.userId;
    } else {
      throw error;
    }
  }

  const refreshTokenDbValid = await isRefreshTokenDbValid(userId, refreshToken);
  await invalidateRefreshToken(userId, refreshToken);
  logger.info("Logout: " + userId);

  if (!refreshTokenDbValid) {
    await invalidateUserRefreshTokens(new ObjectId(userId));
    Logger.warn({
      message: "Refresh token reused",
      userId,
      refreshToken,
    });
    throw new RefreshTokenReusedError();
  }
};

export const refreshToken = async (
  refreshToken: string
): Promise<Omit<Session, "userId">> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

  let userId: string;
  let tokenExpired = false;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
      algorithms: [jwtAlgorithm],
    }) as RefreshTokenPayload;
    userId = decoded.userId;
  } catch (error) {
    const err = error as Error;
    if (err.name === "JsonWebTokenError") {
      throw new RefreshTokenInvalidError();
    } else if (err.name === "TokenExpiredError") {
      tokenExpired = true;
      const payload = jwt.decode(refreshToken) as RefreshTokenPayload;
      userId = payload.userId;
    } else {
      throw error;
    }
  }

  const tokenDbValid = await isRefreshTokenDbValid(userId, refreshToken);
  if (tokenDbValid) {
    if (tokenExpired) {
      throw new RefreshTokenExpiredError();
    }

    await invalidateRefreshToken(userId, refreshToken);

    logger.info("Refreshed tokens for: " + userId);
    const renewedSession = {
      accessToken: createAccessToken(new ObjectId(userId)),
      refreshToken: await createRefreshToken(new ObjectId(userId)),
    };
    return renewedSession;
  } else {
    await invalidateUserRefreshTokens(new ObjectId(userId));
    Logger.warn({
      message: "Refresh token reused",
      userId,
      refreshToken,
    });
    throw new RefreshTokenReusedError();
  }
};

export const getUserById = async (
  userId: string
): Promise<Omit<User, "auth"> | null> => {
  const users = db.collection("users");

  const dbUser = await users.findOne({ _id: new ObjectId(userId) });
  if (!dbUser) return null;
  const user = {
    id: dbUser._id,
    email: dbUser.auth.email.email,
  };
  return user;
};

const createAccessToken = (
  userId: ObjectId,
  expiresIn: number = ACCESS_TOKEN_EXPIRATION
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    algorithm: jwtAlgorithm,
    expiresIn,
  });
  return accessToken;
};

const createRefreshToken = async (
  userId: ObjectId,
  expiresIn: number = REFRESH_TOKEN_EXPIRATION
) => {
  const refreshTokens = db.collection("refreshTokens");

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    algorithm: jwtAlgorithm,
    expiresIn,
  });

  const refreshTokenDb: Omit<RefreshTokenDB, "_id"> = {
    userId: userId,
    refreshToken,
    valid: true,
    iat: Date.now(),
    exp: inXMinutes(REFRESH_TOKEN_EXPIRATION / 60),
  };

  const insertResult = await refreshTokens.insertOne(refreshTokenDb);
  if (!insertResult.acknowledged) {
    throw new CustomError("Could not create refreshToken");
  }

  return refreshToken;
};

const invalidateRefreshToken = async (userId: string, refreshToken: string) => {
  const refreshTokens = db.collection("refreshTokens");

  const updateResult = await refreshTokens.updateOne(
    { userId: new ObjectId(userId), refreshToken },
    { $set: { valid: false } }
  );

  if (!updateResult.acknowledged) {
    throw new CustomError(
      "Could not invalidate refresh token.",
      undefined,
      true,
      {
        userId,
      }
    );
  }
};

const invalidateUserRefreshTokens = async (userId: ObjectId) => {
  const refreshTokens = db.collection("refreshTokens");

  const updateResult = await refreshTokens.updateMany(
    { userId },
    { $set: { valid: false } }
  );

  if (!updateResult.acknowledged) {
    throw new CustomError(
      "Could not invalidate refresh tokens.",
      undefined,
      true,
      {
        userId,
      }
    );
  }
};

const isRefreshTokenDbValid = async (
  userId: string,
  refreshToken: string
): Promise<boolean> => {
  const refreshTokens = db.collection("refreshTokens");

  const refreshTokenDb = await refreshTokens.findOne({
    userId: new ObjectId(userId),
    refreshToken,
  });

  if (refreshTokenDb) {
    const dbToken = refreshTokenDb as RefreshTokenDB;
    return dbToken.valid;
  }
  return false;
};

const createUser = async (): Promise<Omit<User, "auth">> => {
  const users = db.collection("users");

  const insertResult = await users.insertOne({});
  if (!insertResult.acknowledged) {
    throw new CustomError("Could not create user");
  }

  const user: Omit<User, "auth"> = {
    id: insertResult.insertedId,
  };

  return user;
};

const linkUserEmailAuth = async (
  userId: ObjectId,
  email: string,
  password: string
): Promise<User> => {
  const users = db.collection("users");

  try {
    const user: User = {
      id: userId,
      auth: {
        email: {
          email,
          password: await argon2.hash(password),
        },
      },
    };

    const updateResult = await users.updateOne(
      { _id: userId },
      { $set: { auth: user.auth } }
    );

    if (updateResult.modifiedCount !== 1) {
      throw new CustomError(
        "Could not link user to emailAuth",
        undefined,
        true,
        {
          userId,
        }
      );
    }

    return user;
  } catch (err) {
    throw new CustomError("Couldn't hash password");
  }
};

const deleteUser = async (userId: ObjectId) => {
  const users = db.collection("users");

  const deleteResult = await users.deleteOne({ _id: userId });
  if (deleteResult.deletedCount !== 1) {
    throw new CustomError("Could not delete user", undefined, true, {
      userId,
    });
  }
};

const emailExisting = async (email: string): Promise<boolean> => {
  const users = db.collection("users");

  const emailUser = await users.findOne({ "auth.email.email": email });
  return !!emailUser;
};

const isCanaryAccount = (email: string): boolean => {
  const canary1mail = process.env.CANARY1_EMAIL;
  const canary2mail = process.env.CANARY2_EMAIL;
  return email === canary1mail || email === canary2mail;
};
