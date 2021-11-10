import express from "express";
import { emailSignin, emailSignup } from "../controllers/auth";
const authRouter = express.Router();

authRouter.post("/emailSignup", emailSignup);
authRouter.post("/emailSignin", emailSignin);

export default authRouter;
