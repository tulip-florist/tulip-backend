import {
  createEmailUser,
  getUserById,
  logout,
  signEmailUserIn,
  refreshToken,
  ACCESS_TOKEN_EXPIRATION,
} from "../logic/auth";
import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN, AuthRequest, REFRESH_TOKEN } from "../../types/types";
import { inXMinutes, inXMonths } from "../../util/datesHelper";
import { RefreshTokenMissingError } from "../../errors/authErrors";

const ACCESS_TOKEN_COOKIE_EXPIRATION = ACCESS_TOKEN_EXPIRATION / 60; // minutes
const REFRESH_TOKEN_COOKIE_EXPIRATION = 6; // months

export const emailRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO validation
  try {
    await createEmailUser(req.body.email, req.body.password);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

export const emailLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO validation
  try {
    const session = await signEmailUserIn(req.body.email, req.body.password);
    res
      .cookie(ACCESS_TOKEN, session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMinutes(ACCESS_TOKEN_COOKIE_EXPIRATION),
        sameSite: "lax",
      })
      .cookie(REFRESH_TOKEN, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMonths(REFRESH_TOKEN_COOKIE_EXPIRATION),
        sameSite: "lax",
      })
      .sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// Retrieve user information about the current user
export const me = async (
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

export const logOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN];
    if (!refreshToken) throw new RefreshTokenMissingError();

    res.clearCookie(ACCESS_TOKEN).clearCookie(REFRESH_TOKEN);
    await logout(refreshToken);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const token = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies[REFRESH_TOKEN];
    if (!refresh_token) throw new RefreshTokenMissingError();

    const session = await refreshToken(refresh_token);

    res
      .cookie(ACCESS_TOKEN, session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMinutes(ACCESS_TOKEN_COOKIE_EXPIRATION),
        sameSite: "lax",
      })
      .cookie(REFRESH_TOKEN, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: inXMonths(REFRESH_TOKEN_COOKIE_EXPIRATION),
        sameSite: "lax",
      })
      .sendStatus(200);
  } catch (error) {
    res.clearCookie(ACCESS_TOKEN).clearCookie(REFRESH_TOKEN);
    next(error);
  }
};
