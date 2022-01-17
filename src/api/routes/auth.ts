import express from "express";
import {
  emailLogin,
  emailRegister,
  me,
  logOut,
  token,
} from "../controllers/auth";
import { authenticate } from "../middlewares/authJWT";
const authRouter = express.Router();

authRouter.post("/emailRegister", emailRegister);
authRouter.post("/emailLogin", emailLogin);
authRouter.get("/me", authenticate, me);
authRouter.post("/logout", logOut);
authRouter.post("/token", token);

export default authRouter;
