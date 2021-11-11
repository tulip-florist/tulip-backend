import { Document as MongoDoc, ObjectId } from "mongodb";
import { DbClient } from "../../database/database";
import { Document } from "../../types/types";

export const getDocument = async (
  userId: string,
  documentHash: Document["documentHash"]
): Promise<MongoDoc> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const documents = db.collection("documents");

  let document = await documents.findOne({
    userId: new ObjectId(userId),
    documentHash,
  });

  if (!document) throw new Error("No document found");
  return document;
};

export const setOrCreateDocument = async (
  userId: string,
  document: Omit<Document, "id" | "userId">
): Promise<MongoDoc> => {
  const docExists = await documentExists(userId, document.documentHash);
  if (docExists) {
    return await updateAnnotations(userId, document);
  } else {
    return await createDocument(userId, document);
  }
};

const createDocument = async (
  userId: string,
  document: Omit<Document, "id" | "userId">
): Promise<MongoDoc> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const documents = db.collection("documents");

  const annotations = document.annotations ? document.annotations : [];
  const insertResult = await documents.insertOne({
    userId: new ObjectId(userId),
    documentHash: document.documentHash,
    annotations,
  });

  if (!insertResult.acknowledged) throw new Error("Could not create document");
  const newdocument = await documents.findOne({
    _id: insertResult.insertedId,
  });

  if (!newdocument) throw new Error("Could not find created document");
  return newdocument;
};

const updateAnnotations = async (
  userId: string,
  document: Omit<Document, "userId" | "id">
): Promise<MongoDoc> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const documents = db.collection("documents");

  const annotations = document.annotations ? document.annotations : [];
  const result = await documents.updateOne(
    {
      userId: new ObjectId(userId),
      documentHash: document.documentHash,
    },
    {
      $set: {
        annotations,
      },
    }
  );

  if (result.matchedCount !== 1)
    throw new Error("Couldn't find document to update");

  const updatedDocument = await getDocument(userId, document.documentHash);
  return updatedDocument;
};

const documentExists = async (
  userId: string,
  documentHash: string
): Promise<boolean> => {
  try {
    const document = await getDocument(userId, documentHash);
    return !!document;
  } catch (error) {
    // Document not found
    return false;
  }
};
