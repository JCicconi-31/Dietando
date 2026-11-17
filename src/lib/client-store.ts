"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import {
  MealSelection,
  Plan,
  DayOfWeek,
  MealType,
  Option,
  CustomOptionInput,
  ALL_DAYS,
} from "@/types/diet";
import { inferCategoryAndDepartment } from "@/lib/custom-food";

/** Dati dell'utente sincronizzati tra localStorage e server. */
export interface DietData {
  plan: Plan | null;
  selections: Record<string, MealSelection>;
  purchasedItems: Record<string, boolean>;
  weeksCount: number;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  selectedShoppingDays: DayOfWeek[];
}

/** Metadati di sincronizzazione salvati in locale. */
export interface SyncMeta {
  /** `updatedAt` del server all'ultima sincronizzazione riuscita. */
  lastSyncedAt: string | null;
  /** Timestamp (ms) dell'ultima modifica locale non ancora inviata, o null se tutto è sincronizzato. */
  dirtySince: number | null;
}

export interface RemoteDietData {
  plan: Plan | null;
  selections: Record<string, MealSelection>;
  purchased: Record<string, boolean>;
  settings: Partial<Pick<DietData, "weeksCount" | "addFixedVegetables" | "fixedVegetableGrams" | "selectedShoppingDays">>;
  updatedAt: string;
}

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface LocalDietState extends DietData {
  isOnline: boolean;
  isInitialized: boolean;
  syncStatus: SyncStatus;
  setOption: (dayOfWeek: DayOfWeek, mealType: MealType, optionId: string) => void;
  toggleFreeMeal: (dayOfWeek: DayOfWeek, mealType: MealType) => void;
  togglePurchased: (itemKey: string) => void;
  setWeeksCount: (weeks: number) => void;
  setAddFixedVegetables: (enabled: boolean) => void;
  setFixedVegetableGrams: (grams: number) => void;
  setSelectedShoppingDays: (days: DayOfWeek[]) => void;
  toggleShoppingDay: (day: DayOfWeek) => void;
  resetPurchased: () => void;
  updateCustomPlan: (newPlan: Plan) => void;
  removePlan: () => void;
  loadSamplePlan: () => void;
  addCustomOption: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    customData: CustomOptionInput
  ) => Option | null;
  removeCustomOption: (dayOfWeek: DayOfWeek, mealType: MealType, optionId: string) => void;
}

export const DEFAULT_DIET_DATA: DietData = {
  plan: null,
  selections: {},
  purchasedItems: {},
  weeksCount: 1,
  addFixedVegetables: false,
  fixedVegetableGrams: 200,
  selectedShoppingDays: ALL_DAYS,
};

/** Chiavi localStorage isolate per utente (invariate rispetto alle versioni precedenti). */
export function getStorageKeys(uid: string) {
  return {
    plan: `diet_plan_${uid}`,
    selections: `diet_selections_${uid}`,
    purchased: `diet_purchased_${uid}`,
    weeks: `diet_weeks_${uid}`,
    veg: `diet_fixed_veg_${uid}`,
    vegGrams: `diet_fixed_veg_grams_${uid}`,
    shoppingDays: `diet_shopping_days_${uid}`,
    syncMeta: `diet_sync_meta_${uid}`,
  };
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function readJson<T>(storage: StorageLike, key: string, isValid: (v: unknown) => boolean, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isPlan = (v: unknown) => isRecord(v) && typeof v.title === "string" && Array.isArray(v.days);

const isDayList = (v: unknown) =>
  Array.isArray(v) && v.length > 0 && v.every((d) => ALL_DAYS.includes(d as DayOfWeek));

export function loadLocalDietData(storage: StorageLike, uid: string): DietData {
  const keys = getStorageKeys(uid);
  const weeks = Number(storage.getItem(keys.weeks));
  const vegGrams = Number(storage.getItem(keys.vegGrams));

  return {
    plan: readJson<Plan | null>(storage, keys.plan, isPlan, null),
    selections: readJson(storage, keys.selections, isRecord, {}),
    purchasedItems: readJson(storage, keys.purchased, isRecord, {}),
    weeksCount: weeks >= 1 ? weeks : DEFAULT_DIET_DATA.weeksCount,
    addFixedVegetables: storage.getItem(keys.veg) === "true",
    fixedVegetableGrams: vegGrams > 0 ? vegGrams : DEFAULT_DIET_DATA.fixedVegetableGrams,
    selectedShoppingDays: readJson(storage, keys.shoppingDays, isDayList, ALL_DAYS),
  };
}

export function saveLocalDietData(storage: StorageLike, uid: string, data: DietData) {
  const keys = getStorageKeys(uid);
  if (data.plan) storage.setItem(keys.plan, JSON.stringify(data.plan));
  else storage.removeItem(keys.plan);
  storage.setItem(keys.selections, JSON.stringify(data.selections));
  storage.setItem(keys.purchased, JSON.stringify(data.purchasedItems));
  storage.setItem(keys.weeks, String(data.weeksCount));
  storage.setItem(keys.veg, String(data.addFixedVegetables));
  storage.setItem(keys.vegGrams, String(data.fixedVegetableGrams));
  storage.setItem(keys.shoppingDays, JSON.stringify(data.selectedShoppingDays));
}

export function loadSyncMeta(storage: StorageLike, uid: string): SyncMeta {
  return readJson<SyncMeta>(storage, getStorageKeys(uid).syncMeta, isRecord, {
    lastSyncedAt: null,
    dirtySince: null,
  });
}

export function saveSyncMeta(storage: StorageLike, uid: string, meta: SyncMeta) {
  storage.setItem(getStorageKeys(uid).syncMeta, JSON.stringify(meta));
}

export function remoteToDietData(remote: RemoteDietData): DietData {
  const s = remote.settings || {};
  return {
    plan: remote.plan ?? null,
    selections: remote.selections ?? {},
    purchasedItems: remote.purchased ?? {},
    weeksCount: s.weeksCount ?? DEFAULT_DIET_DATA.weeksCount,
    addFixedVegetables: s.addFixedVegetables ?? DEFAULT_DIET_DATA.addFixedVegetables,
    fixedVegetableGrams: s.fixedVegetableGrams ?? DEFAULT_DIET_DATA.fixedVegetableGrams,
    selectedShoppingDays:
      s.selectedShoppingDays && s.selectedShoppingDays.length > 0 ? s.selectedShoppingDays : ALL_DAYS,
  };
}

export function dietDataToPayload(data: DietData) {
  return {
    plan: data.plan,
    selections: data.selections,
    purchased: data.purchasedItems,
    settings: {
      weeksCount: data.weeksCount,
      addFixedVegetables: data.addFixedVegetables,
      fixedVegetableGrams: data.fixedVegetableGrams,
      selectedShoppingDays: data.selectedShoppingDays,
    },
  };
}

/**
 * Decide come riconciliare dati locali e remoti all'avvio.
 * - Nessuna modifica locale pendente → si adottano i dati del server.
 * - Modifiche locali pendenti e server invariato dall'ultimo sync → si inviano quelle locali.
 * - Entrambi modificati → vince il più recente (last-write-wins sul timestamp).
 */
export function resolveInitialSync(
  remote: RemoteDietData | null,
  meta: SyncMeta
): "adopt-remote" | "push-local" | "none" {
  if (!remote) return meta.dirtySince !== null || meta.lastSyncedAt === null ? "push-local" : "none";
  if (meta.dirtySince === null) return "adopt-remote";

  const remoteTime = new Date(remote.updatedAt).getTime();
  const lastSyncedTime = meta.lastSyncedAt ? new Date(meta.lastSyncedAt).getTime() : 0;
  if (remoteTime <= lastSyncedTime) return "push-local";
  return meta.dirtySince > remoteTime ? "push-local" : "adopt-remote";
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
}

const SYNC_DEBOUNCE_MS = 1200;

/**
 * Store dei dati della dieta per l'utente autenticato.
 * Va montato solo lato client e con `key={userId}`, così lo stato viene
 * reinizializzato da localStorage a ogni cambio utente.
 */
export function useDietStore(userId: string, onUnauthorized?: () => void): LocalDietState {
  const [data, setData] = useState<DietData>(() => loadLocalDietData(localStorage, userId));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const isOnline = useOnlineStatus();

  // Il push verso il server parte solo dopo la riconciliazione iniziale col server,
  // per non sovrascrivere i dati remoti con lo stato locale (vuoto o vecchio).
  const [isHydrated, setIsHydrated] = useState(false);
  // Ultimo snapshot noto come allineato al server: evita push inutili.
  const syncedSnapshotRef = useRef<string | null>(null);
  // Snapshot dello stato letto da localStorage al montaggio.
  const initialSnapshotRef = useRef<string | null>(null);
  const onUnauthorizedRef = useRef(onUnauthorized);
  const latestDataRef = useRef(data);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
    latestDataRef.current = data;
  });

  const pushToServer = useCallback(
    async (snapshot: DietData) => {
      setSyncStatus("syncing");
      try {
        const res = await fetch("/api/diet/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dietDataToPayload(snapshot)),
        });
        if (res.status === 401) {
          onUnauthorizedRef.current?.();
          return;
        }
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.error || "Sync fallita");

        const sent = JSON.stringify(snapshot);
        syncedSnapshotRef.current = sent;
        // Marca come sincronizzato solo se nel frattempo non ci sono state nuove modifiche.
        const unchanged = JSON.stringify(latestDataRef.current) === sent;
        saveSyncMeta(localStorage, userId, {
          lastSyncedAt: body.updatedAt,
          dirtySince: unchanged ? null : loadSyncMeta(localStorage, userId).dirtySince,
        });
        setSyncStatus("idle");
      } catch {
        setSyncStatus(navigator.onLine ? "error" : "offline");
      }
    },
    [userId]
  );

  // Riconciliazione iniziale con il server. Se offline o in errore, si riprova
  // al ritorno della connessione: nel frattempo nessun push, così non si
  // sovrascrivono dati più recenti salvati da un altro dispositivo.
  useEffect(() => {
    if (isHydrated || !isOnline) return;
    let cancelled = false;
    fetch("/api/diet/data")
      .then(async (res) => {
        if (res.status === 401) {
          onUnauthorizedRef.current?.();
          return;
        }
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !body.success) {
          setSyncStatus("error");
          return;
        }

        const remote: RemoteDietData | null = body.data;
        const meta = loadSyncMeta(localStorage, userId);
        const decision = resolveInitialSync(remote, meta);

        if (decision === "adopt-remote" && remote) {
          const next = remoteToDietData(remote);
          saveLocalDietData(localStorage, userId, next);
          saveSyncMeta(localStorage, userId, { lastSyncedAt: remote.updatedAt, dirtySince: null });
          syncedSnapshotRef.current = JSON.stringify(next);
          setData(next);
        } else if (decision === "none") {
          syncedSnapshotRef.current = JSON.stringify(loadLocalDietData(localStorage, userId));
        }
        // "push-local": syncedSnapshotRef resta null, quindi l'effetto di salvataggio invierà i dati locali.
        setIsHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setSyncStatus(navigator.onLine ? "error" : "offline");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, isHydrated, isOnline]);

  // Persistenza locale immediata + push al server con debounce.
  useEffect(() => {
    const snapshot = JSON.stringify(data);
    try {
      saveLocalDietData(localStorage, userId, data);
      // La prima esecuzione registra lo stato caricato come riferimento "pulito":
      // qualunque modifica successiva (anche offline) viene marcata come pendente.
      const baseline = syncedSnapshotRef.current ?? initialSnapshotRef.current;
      if (baseline === null) {
        initialSnapshotRef.current = snapshot;
      } else if (baseline !== snapshot) {
        const meta = loadSyncMeta(localStorage, userId);
        if (meta.dirtySince === null) {
          saveSyncMeta(localStorage, userId, { ...meta, dirtySince: Date.now() });
        }
      }
    } catch (e) {
      console.warn("Impossibile salvare su storage locale:", e);
    }

    if (!isHydrated || !isOnline || syncedSnapshotRef.current === snapshot) return;
    const timer = setTimeout(() => void pushToServer(data), SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data, isHydrated, isOnline, userId, pushToServer]);

  const update = useCallback((fn: (prev: DietData) => DietData) => setData(fn), []);

  const setOption = (dayOfWeek: DayOfWeek, mealType: MealType, optionId: string) => {
    const key = `${dayOfWeek}_${mealType}`;
    update((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        [key]: {
          dayOfWeek,
          mealType,
          selectedOptionId: optionId,
          isFreeMeal: false,
          extraVegGrams: prev.selections[key]?.extraVegGrams ?? 0,
        },
      },
    }));
  };

  const toggleFreeMeal = (dayOfWeek: DayOfWeek, mealType: MealType) => {
    const key = `${dayOfWeek}_${mealType}`;
    update((prev) => {
      const current = prev.selections[key];
      return {
        ...prev,
        selections: {
          ...prev.selections,
          [key]: {
            dayOfWeek,
            mealType,
            selectedOptionId: current?.selectedOptionId ?? null,
            isFreeMeal: !current?.isFreeMeal,
            extraVegGrams: current?.extraVegGrams ?? 0,
          },
        },
      };
    });
  };

  const togglePurchased = (itemKey: string) =>
    update((prev) => ({
      ...prev,
      purchasedItems: { ...prev.purchasedItems, [itemKey]: !prev.purchasedItems[itemKey] },
    }));

  const resetPurchased = () => update((prev) => ({ ...prev, purchasedItems: {} }));
  const setWeeksCount = (weeksCount: number) => update((prev) => ({ ...prev, weeksCount }));
  const setAddFixedVegetables = (addFixedVegetables: boolean) =>
    update((prev) => ({ ...prev, addFixedVegetables }));
  const setFixedVegetableGrams = (fixedVegetableGrams: number) =>
    update((prev) => ({ ...prev, fixedVegetableGrams }));

  const setSelectedShoppingDays = (days: DayOfWeek[]) =>
    update((prev) => ({ ...prev, selectedShoppingDays: ALL_DAYS.filter((d) => days.includes(d)) }));

  const toggleShoppingDay = (day: DayOfWeek) =>
    update((prev) => {
      const next = prev.selectedShoppingDays.includes(day)
        ? prev.selectedShoppingDays.filter((d) => d !== day)
        : [...prev.selectedShoppingDays, day];
      return { ...prev, selectedShoppingDays: ALL_DAYS.filter((d) => next.includes(d)) };
    });

  const replacePlan = (plan: Plan | null) =>
    update((prev) => ({ ...prev, plan, selections: {}, purchasedItems: {} }));

  const updateCustomPlan = (newPlan: Plan) => replacePlan(newPlan);
  const removePlan = () => {
    replacePlan(null);
    update((prev) => ({ ...prev, selectedShoppingDays: ALL_DAYS }));
  };
  const loadSamplePlan = () => replacePlan(SAMPLE_PLAN);

  const addCustomOption = (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    customData: CustomOptionInput
  ): Option | null => {
    const plan = data.plan;
    if (!plan) return null;

    const trimmedName = customData.name.trim();
    if (!trimmedName) return null;

    const meal = plan.days
      .find((d) => d.dayOfWeek === dayOfWeek)
      ?.meals.find((m) => m.mealType === mealType);
    if (!meal) return null;

    const inferred = inferCategoryAndDepartment(trimmedName);
    const category = customData.category || inferred.category || "ALTRO";
    const department = customData.department || inferred.department || "Banco Frigo";
    const amount =
      typeof customData.amount === "number" && customData.amount > 0
        ? customData.amount
        : inferred.defaultAmount || 100;
    const unit = customData.unit?.trim() || inferred.defaultUnit || "g";

    const suffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const optId = `custom-opt-${suffix}`;
    const ingId = `custom-ing-${suffix}`;

    const createdOption: Option = {
      id: optId,
      mealId: meal.id,
      name: trimmedName,
      orderIndex: meal.options.length,
      isCustom: true,
      type: "CUSTOM_SUBSTITUTION",
      isCheatMeal: false,
      ingredients: [
        {
          id: `oi-${optId}`,
          ingredientId: ingId,
          ingredient: { id: ingId, name: trimmedName, category, department },
          amount,
          unit,
          notes: customData.notes,
        },
      ],
    };

    const key = `${dayOfWeek}_${mealType}`;
    update((prev) => {
      if (!prev.plan) return prev;
      return {
        ...prev,
        plan: {
          ...prev.plan,
          days: prev.plan.days.map((day) =>
            day.dayOfWeek !== dayOfWeek
              ? day
              : {
                  ...day,
                  meals: day.meals.map((m) =>
                    m.mealType !== mealType ? m : { ...m, options: [...m.options, createdOption] }
                  ),
                }
          ),
        },
        // Seleziona subito l'opzione custom (FR-4) e disattiva il pasto libero
        selections: {
          ...prev.selections,
          [key]: {
            dayOfWeek,
            mealType,
            selectedOptionId: optId,
            isFreeMeal: false,
            extraVegGrams: prev.selections[key]?.extraVegGrams ?? 0,
          },
        },
      };
    });

    return createdOption;
  };

  const removeCustomOption = (dayOfWeek: DayOfWeek, mealType: MealType, optionId: string) => {
    const key = `${dayOfWeek}_${mealType}`;
    update((prev) => {
      if (!prev.plan) return prev;
      let fallbackOptionId: string | null = null;

      const days = prev.plan.days.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.mealType !== mealType) return meal;
            const options = meal.options.filter((opt) => opt.id !== optionId);
            fallbackOptionId = options[0]?.id || null;
            return { ...meal, options };
          }),
        };
      });

      // Se l'opzione rimossa era selezionata, ripristina la prima opzione disponibile
      const current = prev.selections[key];
      const selections =
        current?.selectedOptionId === optionId
          ? { ...prev.selections, [key]: { ...current, selectedOptionId: fallbackOptionId, isFreeMeal: false } }
          : prev.selections;

      return { ...prev, plan: { ...prev.plan, days }, selections };
    });
  };

  return {
    ...data,
    isOnline,
    isInitialized: true,
    syncStatus: isOnline ? syncStatus : "offline",
    setOption,
    toggleFreeMeal,
    togglePurchased,
    setWeeksCount,
    setAddFixedVegetables,
    setFixedVegetableGrams,
    setSelectedShoppingDays,
    toggleShoppingDay,
    resetPurchased,
    updateCustomPlan,
    removePlan,
    loadSamplePlan,
    addCustomOption,
    removeCustomOption,
  };
}
