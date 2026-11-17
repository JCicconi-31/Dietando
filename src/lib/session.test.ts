import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { createSessionToken, verifySessionToken } from "./auth";

const SECRET = "x".repeat(40);

describe("Signed session token", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken("user-1", SECRET);
    expect(verifySessionToken(token, SECRET)).toBe("user-1");
  });

  it("rejects a token with a tampered payload", () => {
    const token = createSessionToken("user-1", SECRET);
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + 1e9 })).toString("base64url");
    expect(verifySessionToken(`${forged}.${sig}`, SECRET)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createSessionToken("user-1", "y".repeat(40));
    expect(verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const issuedAt = Date.now() - 1000 * 60 * 60 * 24 * 31;
    const token = createSessionToken("user-1", SECRET, issuedAt);
    expect(verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects the old unsigned base64 format and garbage", () => {
    const legacy = Buffer.from(JSON.stringify({ id: "user-1", exp: Date.now() + 1e9 })).toString("base64");
    expect(verifySessionToken(legacy, SECRET)).toBeNull();
    expect(verifySessionToken("", SECRET)).toBeNull();
    expect(verifySessionToken("a.b.c", SECRET)).toBeNull();
    expect(verifySessionToken(undefined, SECRET)).toBeNull();
  });
});
