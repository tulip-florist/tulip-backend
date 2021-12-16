import { Response } from "express";
import { AuthRequest, Document } from "../../types/types";
import logger from "../../util/logger";
import { getDocument, setOrCreateDocument } from "../logic/document";

export const getDocumentByUserIdAndHash = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const documentHash = req.params.documentHash as string;
    if (!userId || !documentHash)
      return res.status(400).send({ error: "Missing parameter: documentHash" });

    const document = await getDocument(userId, documentHash);
    const status = document ? 200 : 404;
    res.status(status).send(document);
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      error: (error as Error).message,
    });
  }
};

export const setDocumentByUserIdAndHash = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const documentHash = req.params.documentHash;
    const document = req.body.document as Omit<Document, "id" | "userId">;
    if (!userId || !document)
      return res.status(400).send({ error: "Document missing" });
    if (documentHash !== document.documentHash)
      return res.status(400).send({ error: "Document hashes not matching" });

    const updatedDocument = await setOrCreateDocument(userId, document);
    res.status(200).send(updatedDocument);
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      error: (error as Error).message,
    });
  }
};
