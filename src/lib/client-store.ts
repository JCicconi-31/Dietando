"use client";

import { useEffect, useState, useCallback } from "react";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import { MealSelection, Plan } from "@/types/diet";

export interface LocalDietState {
  plan: Plan | null;
  selections: Record<string, MealSelection>;
  purchasedItems: Record<string, boolean>;
  weeksCount: number;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  isOnline: boolean;
  isInitialized: boolean;
  setOption: (dayOfWeek: string, mealType: string, optionId: string) => void;
  toggleFreeMeal: (dayOfWeek: string, mealType: string) => void;
  togglePurchased: (itemKey: string) => void;
  setWeeksCount: (weeks: number) => void;
  setAddFixedVegetables: (enabled: boolean) => void;
  setFixedVegetableGrams: (grams: number) => void;
  resetPurchased: () => void;
  updateCustomPlan: (newPlan: Plan) => void;
  removePlan: () => void;
  loadSamplePlan: () => void;
}

export function useDietStore(userId?: string | null): LocalDietState {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selections, setSelections] = useState<Record<string, MealSelection>>({});
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});
  const [weeksCount, setWeeksCountState] = useState<number>(1);
  const [addFixedVegetables, setAddFixedVegetablesState] = useState<boolean>(false);
  const [fixedVegetableGrams, setFixedVegetableGramsState] = useState<number>(200);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Helper per chiavi di storage isolate per utente
  const getKeys = useCallback((uid: string) => ({
    plan: `diet_plan_${uid}`,
    selections: `diet_selections_${uid}`,
    purchased: `diet_purchased_${uid}`,
    weeks: `diet_weeks_${uid}`,
    veg: `diet_fixed_veg_${uid}`,
    vegGrams: `diet_fixed_veg_grams_${uid}`,
  }), []);

  // Caricamento iniziale dallo storage locale (strettamente isolato per userId)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!userId) {
      setPlan(null);
      setSelections({});
      setPurchasedItems({});
      setIsInitialized(true);
      return;
    }

    const keys = getKeys(userId);

    try {
      const savedPlan = localStorage.getItem(keys.plan);
      if (savedPlan) {
        try {
          const parsedPlan = JSON.parse(savedPlan);
          setPlan(parsedPlan);
        } catch {
          setPlan(null);
        }
      } else {
        // Nessun piano di default! L'utente deve inserirlo.
        setPlan(null);
      }

      const savedSelections = localStorage.getItem(keys.selections);
      if (savedSelections) {
        setSelections(JSON.parse(savedSelections));
      } else {
        setSelections({});
      }

      const savedPurchased = localStorage.getItem(keys.purchased);
      if (savedPurchased) {
        setPurchasedItems(JSON.parse(savedPurchased));
      } else {
        setPurchasedItems({});
      }

      const savedWeeks = localStorage.getItem(keys.weeks);
      if (savedWeeks) {
        setWeeksCountState(Number(savedWeeks) || 1);
      } else {
        setWeeksCountState(1);
      }

      const savedVeg = localStorage.getItem(keys.veg);
      if (savedVeg !== null) {
        setAddFixedVegetablesState(savedVeg === "true");
      } else {
        setAddFixedVegetablesState(false);
      }

      const savedVegGrams = localStorage.getItem(keys.vegGrams);
      if (savedVegGrams) {
        setFixedVegetableGramsState(Number(savedVegGrams) || 200);
      } else {
        setFixedVegetableGramsState(200);
      }
    } catch (e) {
      console.warn("Impossibile leggere dallo storage locale:", e);
    }

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsInitialized(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, getKeys]);

  // Salvataggio persistente ad ogni mutazione
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined" || !userId) return;
    const keys = getKeys(userId);

    try {
      if (plan) {
        localStorage.setItem(keys.plan, JSON.stringify(plan));
      } else {
        localStorage.removeItem(keys.plan);
      }
      localStorage.setItem(keys.selections, JSON.stringify(selections));
      localStorage.setItem(keys.purchased, JSON.stringify(purchasedItems));
      localStorage.setItem(keys.weeks, weeksCount.toString());
      localStorage.setItem(keys.veg, addFixedVegetables.toString());
      localStorage.setItem(keys.vegGrams, fixedVegetableGrams.toString());
    } catch (e) {
      console.warn("Impossibile salvare su storage locale:", e);
    }
  }, [plan, selections, purchasedItems, weeksCount, addFixedVegetables, fixedVegetableGrams, isInitialized, userId, getKeys]);

  const setOption = (dayOfWeek: string, mealType: string, optionId: string) => {
    const key = `${dayOfWeek}_${mealType}`;
    setSelections((prev) => ({
      ...prev,
      [key]: {
        dayOfWeek: dayOfWeek as any,
        mealType: mealType as any,
        selectedOptionId: optionId,
        isFreeMeal: false,
        extraVegGrams: prev[key]?.extraVegGrams ?? 0,
      },
    }));
  };

  const toggleFreeMeal = (dayOfWeek: string, mealType: string) => {
    const key = `${dayOfWeek}_${mealType}`;
    setSelections((prev) => {
      const current = prev[key];
      const nextIsFree = !current?.isFreeMeal;
      return {
        ...prev,
        [key]: {
          dayOfWeek: dayOfWeek as any,
          mealType: mealType as any,
          selectedOptionId: current?.selectedOptionId ?? null,
          isFreeMeal: nextIsFree,
          extraVegGrams: current?.extraVegGrams ?? 0,
        },
      };
    });
  };

  const togglePurchased = (itemKey: string) => {
    setPurchasedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const resetPurchased = () => {
    setPurchasedItems({});
  };

  const setWeeksCount = (weeks: number) => {
    setWeeksCountState(weeks);
  };

  const setAddFixedVegetables = (enabled: boolean) => {
    setAddFixedVegetablesState(enabled);
  };

  const setFixedVegetableGrams = (grams: number) => {
    setFixedVegetableGramsState(grams);
  };

  const updateCustomPlan = (newPlan: Plan) => {
    setPlan(newPlan);
    setSelections({});
    setPurchasedItems({});
  };

  const removePlan = () => {
    setPlan(null);
    setSelections({});
    setPurchasedItems({});
    if (userId && typeof window !== "undefined") {
      const keys = getKeys(userId);
      localStorage.removeItem(keys.plan);
      localStorage.removeItem(keys.selections);
      localStorage.removeItem(keys.purchased);
    }
  };

  const loadSamplePlan = () => {
    setPlan(SAMPLE_PLAN);
    setSelections({});
    setPurchasedItems({});
  };

  return {
    plan,
    selections,
    purchasedItems,
    weeksCount,
    addFixedVegetables,
    fixedVegetableGrams,
    isOnline,
    isInitialized,
    setOption,
    toggleFreeMeal,
    togglePurchased,
    setWeeksCount,
    setAddFixedVegetables,
    setFixedVegetableGrams,
    resetPurchased,
    updateCustomPlan,
    removePlan,
    loadSamplePlan,
  };
}
