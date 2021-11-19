import express from "express";
import {
  setDocumentByUserIdAndHash,
  getDocumentByUserIdAndHash,
} from "../controllers/document";
const documentRouter = express.Router();

documentRouter.get("/:documentHash", getDocumentByUserIdAndHash);
documentRouter.put("/:documentHash", setDocumentByUserIdAndHash);

export default documentRouter;
