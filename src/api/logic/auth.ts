import { DbClient } from "../../database/database";
import bcrypt from "bcrypt";
import { Session, User } from "../../types/types";
import { ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";
import { emailAlreadyExistsError } from "../../errors/emailAlreadyExistsError";
import { CustomError } from "../../errors/CustomError";

export const jwtAlgorithm: jwt.Algorithm = "HS512";

export const createEmailUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const emailExists = await emailExisting(email);
  if (emailExists) throw new emailAlreadyExistsError();

  const createdUser = await createUser();
  try {
    const emailUser: User = await linkUserEmailAuth(
      createdUser.id,
      email,
      password
    );
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
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const user = await users.findOne({ "auth.email.email": email });
  if (!user) throw new CustomError("User not found.", 404, false);

  let passwordIsValid = bcrypt.compareSync(password, user.auth.email.password);
  if (!passwordIsValid) throw new CustomError("Invalid password.", 403, false);

  const token = signUserToken(user._id);
  const resp: Session = {
    accessToken: token,
    userId: user._id,
  };
  return resp;
};

export const signUserToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

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

export const getUserByAuthtoken = async (
  authToken: string
): Promise<Omit<User, "auth">> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret env variable missing");
  }

  const token = authToken.split(" ")[1]; // "Bearer <token>"

  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: [jwtAlgorithm],
  }) as JwtPayload;
  const decodedUserId: string = decoded.id;

  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const dbUser = await users.findOne({ _id: new ObjectId(decodedUserId) });
  if (dbUser) {
    // user will contain more information in the future
    const user = {
      id: dbUser._id,
      email: dbUser.auth.email.email,
    };
    return user;
  } else {
    // dbUser must exist since it passed the auth middleware
    // if this error get's thrown something is wrong with the auth middleware
    throw new CustomError("Invalid authorization token", undefined, true, {
      token,
      decodedUserId,
      dbUser,
    });
  }
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

  const insertResult = await users.insertOne({});
  if (!insertResult.acknowledged) {
    throw new CustomError("Could not create user", undefined, true);
  }

  const user: Omit<User, "auth"> = {
    id: insertResult.insertedId,
  };

  return user;
};

const emailExisting = async (email: string): Promise<boolean> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const emailUser = await users.findOne({ "auth.email.email": email });
  return !!emailUser;
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

  if (updateResult.modifiedCount !== 1) {
    throw new CustomError("Could not link user to emailAuth", undefined, true, {
      userId,
    });
  }

  return user;
};

const deleteUser = async (userId: ObjectId) => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const users = db.collection("users");

  const deleteResult = await users.deleteOne({ _id: userId });
  if (deleteResult.deletedCount !== 1) {
    throw new CustomError("Could not delete user", undefined, true, {
      userId,
    });
  }
};
