import express from "express";
import {
  emailLogin,
  emailRegister,
  me,
  logOut,
  token,
} from "../controllers/auth";
import { authenticate } from "../middlewares/authJWT";
import {
  authApiLimiter,
  refreshTokenApiLimiter,
} from "../middlewares/rateLimit";
const authRouter = express.Router();

authRouter.post("/emailRegister", authApiLimiter, emailRegister);
authRouter.post("/emailLogin", authApiLimiter, emailLogin);
authRouter.get("/me", authenticate, me);
authRouter.post("/token", refreshTokenApiLimiter, token);
authRouter.post("/logout", logOut);

export default authRouter;
