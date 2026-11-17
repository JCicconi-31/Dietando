import { describe, it, expect, vi, beforeEach } from "vitest";

const { cookieJar, prismaMock } = vi.hoisted(() => ({
  cookieJar: new Map<string, string>(),
  prismaMock: {
    user: { findUnique: vi.fn() },
    userDietData: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET, POST } from "./route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const login = (userId: string) => cookieJar.set(SESSION_COOKIE_NAME, createSessionToken(userId));

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/diet/data", { method: "POST", body: JSON.stringify(body) }));

describe("/api/diet/data authorization", () => {
  beforeEach(() => {
    cookieJar.clear();
    vi.clearAllMocks();
    prismaMock.user.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
      where.id === "alice" ? { id: "alice", email: "a@x.it", name: "Alice" } : null
    );
    prismaMock.userDietData.upsert.mockResolvedValue({ updatedAt: new Date("2026-11-17T00:00:00Z") });
    prismaMock.userDietData.findUnique.mockResolvedValue(null);
  });

  it("returns 401 without a session cookie", async () => {
    expect((await GET()).status).toBe(401);
    expect((await post({ plan: null })).status).toBe(401);
    expect(prismaMock.userDietData.upsert).not.toHaveBeenCalled();
  });

  it("returns 401 with a forged unsigned cookie", async () => {
    cookieJar.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify({ id: "alice", exp: Date.now() + 1e9 })).toString("base64"));
    expect((await GET()).status).toBe(401);
  });

  it("returns 401 when the user in the session no longer exists", async () => {
    login("deleted-user");
    expect((await GET()).status).toBe(401);
  });

  it("ignores any userId sent by the client and writes only to the session user", async () => {
    login("alice");
    const res = await post({ userId: "bob", selections: {} });
    expect(res.status).toBe(200);
    expect(prismaMock.userDietData.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "alice" } })
    );
  });

  it("reads only the session user's data", async () => {
    login("alice");
    await GET();
    expect(prismaMock.userDietData.findUnique).toHaveBeenCalledWith({ where: { userId: "alice" } });
  });

  it("rejects malformed payloads", async () => {
    login("alice");
    expect((await post({ plan: { title: 123 } })).status).toBe(400);
    expect((await post({ settings: { weeksCount: 999 } })).status).toBe(400);
    expect(prismaMock.userDietData.upsert).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads", async () => {
    login("alice");
    const res = await post({ purchased: { ["x".repeat(200)]: true }, plan: { title: "a".repeat(1_100_000), days: [] } });
    expect(res.status).toBe(413);
  });
});
