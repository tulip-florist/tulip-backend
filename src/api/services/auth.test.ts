import _ from "lodash";
import { User } from "../../types/types";
import { clearTestDb } from "../../util/tests/database";
import { createEmailUser } from "./auth";

describe("createEmailUser", () => {
  beforeAll(() => {
    clearTestDb;
  });

  test("creates correct user", async () => {
    const user: Omit<User, "id"> = {
      auth: {
        email: {
          email: "user1@test.test",
          password: "",
        },
      },
    };
    const createdUser = await createEmailUser(user.auth.email?.email!, "pw");
    expect(_.omit(createdUser, "id")).toEqual({
      auth: {
        email: {
          password: createdUser?.auth.email?.password,
          email: user.auth.email?.email,
        },
      },
    });
  });

  test("throws emailAlreadyUsedError", async () => {
    expect(await createEmailUser("duplicate@test.test", "pw")).not.toThrowError;
    await expect(
      createEmailUser("duplicate@test.test", "pw")
    ).rejects.toThrowError("Email already registered");
  });
});
