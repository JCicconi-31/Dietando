import { describe, it, expect, beforeEach } from "vitest";
import { registerUser, loginUser, getCurrentAuthUser, logoutUser, deleteUserAccount } from "./client-auth";

// Polyfill per localStorage e crypto in ambiente test se necessario
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] || null;
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
}

// @ts-ignore
global.localStorage = new LocalStorageMock();

describe("Client Authentication & Data Isolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("requires authentication and rejects unauthenticated access", () => {
    const current = getCurrentAuthUser();
    expect(current).toBeNull();
  });

  it("registers a new user and creates an authenticated session", async () => {
    const reg = await registerUser("Jacopo", "jacopo@test.it", "password123");
    expect(reg.success).toBe(true);
    expect(reg.user).toBeDefined();
    expect(reg.user?.name).toBe("Jacopo");
    expect(reg.user?.email).toBe("jacopo@test.it");

    const current = getCurrentAuthUser();
    expect(current?.id).toBe(reg.user?.id);
  });

  it("authenticates an existing user and rejects wrong credentials", async () => {
    await registerUser("Jacopo", "jacopo@test.it", "password123");
    logoutUser();
    expect(getCurrentAuthUser()).toBeNull();

    const badLogin = await loginUser("jacopo@test.it", "wrongpassword");
    expect(badLogin.success).toBe(false);
    expect(getCurrentAuthUser()).toBeNull();

    const goodLogin = await loginUser("jacopo@test.it", "password123");
    expect(goodLogin.success).toBe(true);
    expect(getCurrentAuthUser()?.name).toBe("Jacopo");
  });

  it("logs out and clears current user session", async () => {
    await registerUser("Jacopo", "jacopo@test.it", "password123");
    expect(getCurrentAuthUser()).not.toBeNull();

    logoutUser();
    expect(getCurrentAuthUser()).toBeNull();
  });

  it("deletes user account and associated private data", async () => {
    const reg = await registerUser("Jacopo", "jacopo@test.it", "password123");
    const userId = reg.user!.id;

    // Simula dati isolati salvati per l'utente
    localStorage.setItem(`diet_plan_${userId}`, JSON.stringify({ title: "La mia dieta privata" }));
    localStorage.setItem(`diet_selections_${userId}`, JSON.stringify({}));

    deleteUserAccount(userId);

    expect(getCurrentAuthUser()).toBeNull();
    expect(localStorage.getItem(`diet_plan_${userId}`)).toBeNull();
  });
});
