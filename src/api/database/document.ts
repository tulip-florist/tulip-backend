import { db } from "./database";
import { ObjectId } from "mongodb";
import { Annotation, Document } from "../../types/types";
import logger from "../../util/logger";
import { CustomError } from "../../errors/CustomError";

export const getDocumentDb = async (
  userId: string,
  documentHash: Document["documentHash"]
): Promise<Document | null> => {
  try {
    const documents = db.collection("documents");
    let document = await documents.findOne({
      userId: new ObjectId(userId),
      documentHash,
    });

    return document as Document;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const createDocumentDb = async (
  userId: string,
  document: Omit<Document, "id" | "userId">
): Promise<Document> => {
  try {
    const documents = db.collection("documents");
    await documents.insertOne({
      userId: new ObjectId(userId),
      ...document,
    });

    const newDocument = await getDocumentDb(userId, document.documentHash);
    if (!newDocument) {
      throw new CustomError("Could not create document");
    }
    return newDocument;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const updateDocumentAnnotationsDb = async (
  userId: string,
  documentHash: string,
  annotations: Array<Annotation>
): Promise<Document | null> => {
  try {
    const documents = db.collection("documents");
    const updateResult = await documents.findOneAndUpdate(
      {
        userId: new ObjectId(userId),
        documentHash: documentHash,
      },
      {
        $set: {
          annotations,
        },
      },
      { returnDocument: "after" }
    );
    const updatedDocument = updateResult.value;
    return updatedDocument as Document;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
