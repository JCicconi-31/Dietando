import { describe, it, expect } from "vitest";
import {
  resolveInitialSync,
  loadLocalDietData,
  saveLocalDietData,
  remoteToDietData,
  DEFAULT_DIET_DATA,
  RemoteDietData,
} from "./client-store";
import { SAMPLE_PLAN } from "@/data/sample-plan";

class MemoryStorage {
  store: Record<string, string> = {};
  getItem(k: string) {
    return this.store[k] ?? null;
  }
  setItem(k: string, v: string) {
    this.store[k] = v;
  }
  removeItem(k: string) {
    delete this.store[k];
  }
}

const remote = (updatedAt: string): RemoteDietData => ({
  plan: null,
  selections: {},
  purchased: {},
  settings: {},
  updatedAt,
});

describe("resolveInitialSync", () => {
  const T1 = "2026-11-10T10:00:00.000Z";
  const T2 = "2026-11-12T10:00:00.000Z";

  it("adopts remote data when there are no pending local changes", () => {
    expect(resolveInitialSync(remote(T2), { lastSyncedAt: T1, dirtySince: null })).toBe("adopt-remote");
  });

  it("pushes local changes made offline when the server did not change", () => {
    const dirty = new Date("2026-11-11T10:00:00Z").getTime();
    expect(resolveInitialSync(remote(T1), { lastSyncedAt: T1, dirtySince: dirty })).toBe("push-local");
  });

  it("uses last-write-wins when both sides changed", () => {
    const olderLocal = new Date("2026-11-11T10:00:00Z").getTime();
    const newerLocal = new Date("2026-11-13T10:00:00Z").getTime();
    expect(resolveInitialSync(remote(T2), { lastSyncedAt: T1, dirtySince: olderLocal })).toBe("adopt-remote");
    expect(resolveInitialSync(remote(T2), { lastSyncedAt: T1, dirtySince: newerLocal })).toBe("push-local");
  });

  it("uploads local data when the server has nothing yet", () => {
    expect(resolveInitialSync(null, { lastSyncedAt: null, dirtySince: null })).toBe("push-local");
    expect(resolveInitialSync(null, { lastSyncedAt: T1, dirtySince: null })).toBe("none");
  });
});

describe("local persistence", () => {
  it("round-trips diet data through storage", () => {
    const s = new MemoryStorage();
    const data = { ...DEFAULT_DIET_DATA, plan: SAMPLE_PLAN, weeksCount: 2, addFixedVegetables: true };
    saveLocalDietData(s, "u1", data);
    expect(loadLocalDietData(s, "u1")).toEqual(data);
    // isolamento per utente
    expect(loadLocalDietData(s, "u2")).toEqual(DEFAULT_DIET_DATA);
  });

  it("falls back to defaults on corrupted storage", () => {
    const s = new MemoryStorage();
    s.setItem("diet_plan_u1", "{not json");
    s.setItem("diet_shopping_days_u1", JSON.stringify(["FOO"]));
    s.setItem("diet_weeks_u1", "abc");
    expect(loadLocalDietData(s, "u1")).toEqual(DEFAULT_DIET_DATA);
  });

  it("maps remote payload with missing settings to defaults", () => {
    expect(remoteToDietData(remote("2026-01-01T00:00:00Z"))).toEqual(DEFAULT_DIET_DATA);
  });
});
