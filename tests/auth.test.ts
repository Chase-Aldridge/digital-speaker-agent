import { test, expect, describe } from "bun:test";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../server/auth.ts";

describe("password hashing", () => {
  test("hash verifies against the original password", async () => {
    const hash = await hashPassword("hunter2pass");
    expect(hash).not.toBe("hunter2pass");
    expect(await verifyPassword("hunter2pass", hash)).toBe(true);
  });

  test("wrong password fails verification", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("wrong-horse", hash)).toBe(false);
  });

  test("malformed hash does not throw", async () => {
    expect(await verifyPassword("anything", "not-a-real-hash")).toBe(false);
  });
});

describe("jwt tokens", () => {
  test("token round-trips to the same user id", async () => {
    const token = await signToken("user-123");
    expect(typeof token).toBe("string");
    expect(await verifyToken(token)).toBe("user-123");
  });

  test("garbage token returns null", async () => {
    expect(await verifyToken("garbage.token.value")).toBe(null);
    expect(await verifyToken("")).toBe(null);
  });
});
