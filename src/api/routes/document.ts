import express from "express";
import {
  setDocumentByUserIdAndHash,
  getDocumentByUserIdAndHash,
} from "../controllers/document";
const documentRouter = express.Router();

documentRouter.get("/getByHash", getDocumentByUserIdAndHash);
documentRouter.put("/setByHash", setDocumentByUserIdAndHash);

export default documentRouter;
