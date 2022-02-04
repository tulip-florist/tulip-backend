import _ from "lodash";
import { User } from "../../types/types";
import { clearTestDb } from "../../util/tests/database";
import { createDocumentDb, getDocumentDb } from "../database/document";
import { createEmailUser } from "./auth";
import { createOrUpdateDocumentAnnotations, getDocument } from "./document";

describe("createOrUpdateDocumentAnnotations", () => {
  let user: User | null;
  const document = {
    documentHash: "docHash",
    annotations: [{ id: "a", color: "a", highlight: "a", position: "a" }],
  };

  beforeAll(async () => {
    await clearTestDb();
    user = await createEmailUser("user1@test.test", "pw");
    await createDocumentDb(user?.id.toString()!, document);
  });

  test("does return document without database id's", async () => {
    const updateResult = await createOrUpdateDocumentAnnotations(
      user?.id.toString()!,
      document
    );
    expect(updateResult).not.toHaveProperty("_id");
    expect(updateResult).not.toHaveProperty("userId");
  });

  test("does update existing document", async () => {
    const updatedDoc = {
      documentHash: "docHash",
      annotations: [{ id: "u", color: "u", highlight: "u", position: "u" }],
    };
    const updateResult = await createOrUpdateDocumentAnnotations(
      user?.id.toString()!,
      updatedDoc
    );
    const updatedDocDb = await getDocumentDb(
      user?.id.toString()!,
      document.documentHash
    );
    expect(updateResult).toEqual(updatedDoc);
    expect(_.omit(updatedDocDb, "_id", "userId")).toEqual(updateResult);
  });
});

describe("getDocument", () => {
  let user1: User | null;
  let user2: User | null;
  const doc1 = {
    documentHash: "docHash",
    annotations: [{ id: "a1", color: "a1", highlight: "a1", position: "a1" }],
  };
  const doc2 = {
    documentHash: "docHash",
    annotations: [{ id: "a2", color: "a2", highlight: "a2", position: "a2" }],
  };

  beforeAll(async () => {
    await clearTestDb();
    user1 = await createEmailUser("user1@test.test", "pw");
    user2 = await createEmailUser("user2@test.test", "pw");
    await createDocumentDb(user1?.id.toString()!, doc1);
    await createDocumentDb(user2?.id.toString()!, doc2);
  });

  test("does return document without database id's", async () => {
    const doc = await getDocument(user2?.id.toString()!, doc1.documentHash);
    expect(doc).not.toHaveProperty("_id");
    expect(doc).not.toHaveProperty("userId");
  });

  test("doesn't return document(same hash) from different user", async () => {
    const doc = await getDocument(user1?.id.toString()!, doc1.documentHash);
    expect(doc).toEqual(doc1);
  });
});
