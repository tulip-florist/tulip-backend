import express from "express";
import { emailSignin, emailSignup, me } from "../controllers/auth";
const authRouter = express.Router();

authRouter.post("/emailSignup", emailSignup);
authRouter.post("/emailSignin", emailSignin);
authRouter.get("/me", me);

export default authRouter;
