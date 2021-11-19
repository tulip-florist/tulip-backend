import { Document as MongoDoc, ObjectId } from "mongodb";
import { DbClient } from "../../database/database";
import { Document } from "../../types/types";

export const getDocument = async (
  userId: string,
  documentHash: Document["documentHash"]
): Promise<MongoDoc | null> => {
  const client = await DbClient.getInstance();
  const db = client.db(process.env.DB_NAME);
  const documents = db.collection("documents");

  let document = await documents.findOne({
    userId: new ObjectId(userId),
    documentHash,
  });

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
  const result = await documents.findOneAndUpdate(
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
  const updatedDocument = result.value;
  if (!updatedDocument) throw new Error("Couldn't find document to update");
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
