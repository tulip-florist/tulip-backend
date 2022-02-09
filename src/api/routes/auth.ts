import express from "express";
import {
  emailLoginController,
  emailRegisterController,
  meController,
  logOutController,
  tokenController,
} from "../controllers/auth";
import { authenticate } from "../middlewares/authJWT";
import {
  authApiLimiter,
  refreshTokenApiLimiter,
} from "../middlewares/rateLimit";
const authRouter = express.Router();

authRouter.post("/emailRegister", authApiLimiter, emailRegisterController);
authRouter.post("/emailLogin", authApiLimiter, emailLoginController);
authRouter.get("/me", authenticate, meController);
authRouter.post("/token", refreshTokenApiLimiter, tokenController);
authRouter.post("/logout", logOutController);

export default authRouter;
