import {
  createEmailUser,
  getUserById,
  logout,
  signEmailUserIn,
  refreshToken,
  ACCESS_TOKEN_EXPIRATION,
} from "../services/auth";
import { NextFunction, Request, Response } from "express";
import { AuthRequest, Tokens } from "../../types/types";
import { inXMinutes, inXMonths } from "../../util/datesHelper";
import { RefreshTokenMissingError } from "../../errors/authErrors";
import validator from "validator";
import { CustomError } from "../../errors/CustomError";

const ACCESS_TOKEN_COOKIE_EXPIRATION = ACCESS_TOKEN_EXPIRATION / 60; // minutes
const REFRESH_TOKEN_COOKIE_EXPIRATION = 6; // months

export const emailRegisterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email))
      throw new CustomError("Invalid email", 400, false);
    if (!validator.isStrongPassword(password))
      throw new CustomError("Password not strong enough", 400, false);

    const normEmail = validator.trim(validator.normalizeEmail(email) || email);
    const normPassword = validator.trim(password);

    await createEmailUser(normEmail, normPassword);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

export const emailLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email))
      throw new CustomError("Invalid email", 400, false);

    const normEmail = validator.trim(validator.normalizeEmail(email) || email);
    const normPassword = validator.trim(password);

    const session = await signEmailUserIn(normEmail, normPassword);
    res
      .cookie(Tokens.ACCESS_TOKEN, session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMinutes(ACCESS_TOKEN_COOKIE_EXPIRATION),
        sameSite: "strict",
      })
      .cookie(Tokens.REFRESH_TOKEN, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMonths(REFRESH_TOKEN_COOKIE_EXPIRATION),
        sameSite: "strict",
      })
      .sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Retrieve user information about the current user
export const meController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUserById(req.userId!); // req.userId must be set if authentication was successful
    res.status(200).send({
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logOutController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[Tokens.REFRESH_TOKEN];
    if (!refreshToken) throw new RefreshTokenMissingError();

    res.clearCookie(Tokens.ACCESS_TOKEN).clearCookie(Tokens.REFRESH_TOKEN);
    await logout(refreshToken);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const tokenController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies[Tokens.REFRESH_TOKEN];
    if (!refresh_token) throw new RefreshTokenMissingError();

    const session = await refreshToken(refresh_token);

    res
      .cookie(Tokens.ACCESS_TOKEN, session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMinutes(ACCESS_TOKEN_COOKIE_EXPIRATION),
        sameSite: "strict",
      })
      .cookie(Tokens.REFRESH_TOKEN, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMonths(REFRESH_TOKEN_COOKIE_EXPIRATION),
        sameSite: "strict",
      })
      .sendStatus(200);
  } catch (error) {
    res.clearCookie(Tokens.ACCESS_TOKEN).clearCookie(Tokens.REFRESH_TOKEN);
    next(error);
  }
};
