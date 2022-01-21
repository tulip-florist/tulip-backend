import { NextFunction, Response } from "express";
import { CustomError } from "../../errors/CustomError";
import { AuthRequest, Document } from "../../types/types";
import { getDocument, setOrCreateDocument } from "../logic/document";

export const getDocumentByUserIdAndHash = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentHash = req.params.documentHash as string;

    if (!documentHash)
      throw new CustomError("'documentHash' missing", 400, false);

    const document = await getDocument(req.userId!, documentHash);
    const status = document ? 200 : 404;
    res.status(status).send(document);
  } catch (error) {
    next(error);
  }
};

export const setDocumentByUserIdAndHash = async (
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

    const updatedDocument = await setOrCreateDocument(req.userId!, document);
    res.status(200).send(updatedDocument);
  } catch (error) {
    next(error);
  }
};
