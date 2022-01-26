import { NextFunction, Response } from "express";
import { CustomError } from "../../errors/CustomError";
import { AuthRequest, Document } from "../../types/types";
import {
  getDocument,
  createOrUpdateDocumentAnnotations,
} from "../services/document";

export const getDocumentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentHash = req.params.documentHash as string;

    if (!documentHash)
      throw new CustomError("'documentHash' missing", 400, false);

    const documentDb = await getDocument(req.userId!, documentHash);
    const status = documentDb ? 200 : 404;
    res.status(status).json(documentDb);
  } catch (error) {
    next(error);
  }
};

export const setDocumentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentHash = req.params.documentHash;
    const document = req.body.document as Omit<Document, "id" | "userId">;

    if (!document) throw new CustomError("'document' missing", 400, false);

    if (documentHash !== document.documentHash) {
      throw new CustomError("document hashes not matching", 400, false);
    }

    const updatedDocument = await createOrUpdateDocumentAnnotations(
      req.userId!,
      document
    );
    res.status(200).json(updatedDocument);
  } catch (error) {
    next(error);
  }
};
