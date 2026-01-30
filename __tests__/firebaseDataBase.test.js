import { saveUserData } from "../services/firebaseDataBase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/config";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("../services/config", () => ({
  db: { __mock: true },
}));

describe("saveUserData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws when uid is missing", async () => {
    await expect(saveUserData()).rejects.toThrow("Missing uid for saveUserData");
  });

  test("writes merged data to users collection", async () => {
    const ref = { id: "ref" };
    doc.mockReturnValueOnce(ref);

    await saveUserData("user-123", { name: "Timo" });

    expect(doc).toHaveBeenCalledWith(db, "users", "user-123");
    expect(setDoc).toHaveBeenCalledWith(ref, { name: "Timo" }, { merge: true });
  });
});
