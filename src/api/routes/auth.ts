import express from "express";
import { emailSignin, emailSignup, me } from "../controllers/auth";
import { authenticate } from "../middlewares/authJWT";
const authRouter = express.Router();

authRouter.post("/emailSignup", emailSignup);
authRouter.post("/emailSignin", emailSignin);
authRouter.get("/me", authenticate, me);

export default authRouter;
