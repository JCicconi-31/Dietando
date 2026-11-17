import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  registerUser,
  loginUser,
  getCurrentAuthUser,
  logoutUser,
  deleteUserAccount,
  refreshSession,
  purgeLegacyAuthData,
} from "./client-auth";

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  dump() {
    return JSON.stringify(this.store);
  }
}

const storage = new LocalStorageMock();
(globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = storage;

const USER = { id: "u1", name: "Jacopo", email: "jacopo@test.it" };

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("Client Authentication & Data Isolation", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    storage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires authentication when nothing is cached", () => {
    expect(getCurrentAuthUser()).toBeNull();
  });

  it("registers via the server and caches only the public profile", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, user: USER }));
    const reg = await registerUser("Jacopo", "jacopo@test.it", "password123");

    expect(reg.success).toBe(true);
    expect(reg.user).toEqual(USER);
    expect(getCurrentAuthUser()).toEqual(USER);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/register");
    // Nessuna password né hash salvati sul dispositivo
    expect(storage.dump()).not.toContain("password123");
    expect(storage.dump()).not.toContain("passwordHash");
  });

  it("rejects wrong credentials without caching a user", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Credenziali non valide." }));
    const res = await loginUser("jacopo@test.it", "wrong");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Credenziali non valide.");
    expect(getCurrentAuthUser()).toBeNull();
  });

  it("fails login gracefully when offline", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const res = await loginUser("jacopo@test.it", "password123");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/connessione/);
  });

  it("logs out, clears cached profile and calls the server", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, user: USER }));
    await loginUser("jacopo@test.it", "password123");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await logoutUser();
    expect(getCurrentAuthUser()).toBeNull();
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/logout");
  });

  it("refreshSession clears cache on 401 but keeps it when offline", async () => {
    storage.setItem("diet_current_user", JSON.stringify(USER));

    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    expect(await refreshSession()).toEqual(USER);

    fetchMock.mockResolvedValueOnce(jsonResponse(401, { success: false }));
    expect(await refreshSession()).toBeNull();
    expect(getCurrentAuthUser()).toBeNull();
  });

  it("deletes the account on the server, then wipes local data", async () => {
    storage.setItem("diet_current_user", JSON.stringify(USER));
    storage.setItem(`diet_plan_${USER.id}`, JSON.stringify({ title: "La mia dieta privata" }));
    storage.setItem(`diet_selections_${USER.id}`, JSON.stringify({}));

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true }));
    const res = await deleteUserAccount(USER.id);

    expect(res.success).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/account");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
    expect(getCurrentAuthUser()).toBeNull();
    expect(storage.getItem(`diet_plan_${USER.id}`)).toBeNull();
  });

  it("keeps local data if server deletion fails", async () => {
    storage.setItem(`diet_plan_${USER.id}`, "{}");
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { success: false, error: "boom" }));

    const res = await deleteUserAccount(USER.id);
    expect(res.success).toBe(false);
    expect(storage.getItem(`diet_plan_${USER.id}`)).toBe("{}");
  });

  it("purges legacy keys that stored password hashes", () => {
    storage.setItem("diet_registered_users", JSON.stringify([{ passwordHash: "abc" }]));
    storage.setItem("diet_current_user_id", "u1");
    purgeLegacyAuthData();
    expect(storage.getItem("diet_registered_users")).toBeNull();
    expect(storage.getItem("diet_current_user_id")).toBeNull();
  });
});
