import express from "express";
import {
  setDocumentController,
  getDocumentController,
} from "../controllers/document";
const documentRouter = express.Router();

documentRouter.get("/:documentHash", getDocumentController);
documentRouter.put("/:documentHash", setDocumentController);

export default documentRouter;
