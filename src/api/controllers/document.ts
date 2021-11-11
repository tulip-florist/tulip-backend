import { Response } from "express";
import { AuthRequest, Document } from "../../types/types";
import { getDocument, setOrCreateDocument } from "../logic/document";

export const getDocumentByUserIdAndHash = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const documentHash = req.query.documentHash as string;
    if (!userId || !documentHash) throw new Error("Invalid arguments");

    const document = await getDocument(userId, documentHash);
    res.status(200).send(document);
  } catch (error) {
    console.log((error as Error).message);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const setDocumentByUserIdAndHash = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const document = req.body.document as Omit<Document, "id" | "userId">;
    if (!userId || !document) throw new Error("Invalid arguments");

    const updatedDocument = await setOrCreateDocument(userId, document);
    res.status(200).send(updatedDocument);
  } catch (error) {
    console.log((error as Error).message);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};
