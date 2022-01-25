import { Document as MongoDoc } from "mongodb";
import { CustomError } from "../../errors/CustomError";
import { Document } from "../../types/types";
import {
  createDocumentDb,
  getDocumentDb,
  updateDocumentAnnotationsDb,
} from "../database/document";
import _ from "lodash";

type CleanDoc = Omit<Document, "_id" | "userId">;

export const getDocument = async (
  userId: string,
  documentHash: Document["documentHash"]
): Promise<CleanDoc | null> => {
  const documentDb = await getDocumentDb(userId, documentHash);
  if (!documentDb) return null;

  const document = removeDbIds(documentDb);
  return document;
};

export const createOrUpdateDocumentAnnotations = async (
  userId: string,
  document: Omit<Document, "id" | "userId">
): Promise<CleanDoc> => {
  const docExists = await documentExists(userId, document.documentHash);
  const annotations = document.annotations ? document.annotations : [];

  if (docExists) {
    const updatedDocumentDb = await updateDocumentAnnotationsDb(
      userId,
      document.documentHash,
      annotations
    );
    if (!updatedDocumentDb) {
      throw new CustomError("Could not update document annotations");
    }
    const updatedDocument = removeDbIds(updatedDocumentDb);
    return updatedDocument;
  } else {
    const newDocumentDb = await createDocumentDb(userId, document);
    const newDocument = removeDbIds(newDocumentDb);
    return newDocument;
  }
};

const documentExists = async (
  userId: string,
  documentHash: string
): Promise<boolean> => {
  const document = await getDocumentDb(userId, documentHash);
  return !!document;
};

const removeDbIds = (document: Document): CleanDoc => {
  return _.omit(document, "_id", "userId");
};
