import express from "express";
import {
  setDocumentController,
  getDocumentController,
} from "../controllers/document";
import { documentApiLimiter } from "../middlewares/rateLimit";
const documentRouter = express.Router();

documentRouter.use(documentApiLimiter);

documentRouter.get("/:documentHash", getDocumentController);
documentRouter.put("/:documentHash", setDocumentController);

export default documentRouter;
