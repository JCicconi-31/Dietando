"use client";

import { useEffect, useState } from "react";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import { MealSelection, Plan } from "@/types/diet";

const STORAGE_KEYS = {
  ACTIVE_PLAN: "diet_active_plan",
  MENU_SELECTIONS: "diet_menu_selections",
  PURCHASED_ITEMS: "diet_purchased_items",
  WEEKS_COUNT: "diet_weeks_count",
  FIXED_VEG: "diet_fixed_veg_enabled",
  FIXED_VEG_GRAMS: "diet_fixed_veg_grams",
};

export interface LocalDietState {
  plan: Plan;
  selections: Record<string, MealSelection>;
  purchasedItems: Record<string, boolean>;
  weeksCount: number;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  isOnline: boolean;
  setOption: (dayOfWeek: string, mealType: string, optionId: string) => void;
  toggleFreeMeal: (dayOfWeek: string, mealType: string) => void;
  togglePurchased: (itemKey: string) => void;
  setWeeksCount: (weeks: number) => void;
  setAddFixedVegetables: (enabled: boolean) => void;
  setFixedVegetableGrams: (grams: number) => void;
  resetPurchased: () => void;
  updateCustomPlan: (newPlan: Plan) => void;
}

export function useDietStore(): LocalDietState {
  const [plan, setPlan] = useState<Plan>(SAMPLE_PLAN);
  const [selections, setSelections] = useState<Record<string, MealSelection>>({});
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});
  const [weeksCount, setWeeksCountState] = useState<number>(1);
  const [addFixedVegetables, setAddFixedVegetablesState] = useState<boolean>(false);
  const [fixedVegetableGrams, setFixedVegetableGramsState] = useState<number>(200);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Caricamento iniziale dallo storage locale (offline-ready)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedPlan = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      }

      const savedSelections = localStorage.getItem(STORAGE_KEYS.MENU_SELECTIONS);
      if (savedSelections) {
        setSelections(JSON.parse(savedSelections));
      }

      const savedPurchased = localStorage.getItem(STORAGE_KEYS.PURCHASED_ITEMS);
      if (savedPurchased) {
        setPurchasedItems(JSON.parse(savedPurchased));
      }

      const savedWeeks = localStorage.getItem(STORAGE_KEYS.WEEKS_COUNT);
      if (savedWeeks) {
        setWeeksCountState(Number(savedWeeks) || 1);
      }

      const savedVeg = localStorage.getItem(STORAGE_KEYS.FIXED_VEG);
      if (savedVeg !== null) {
        setAddFixedVegetablesState(savedVeg === "true");
      }

      const savedVegGrams = localStorage.getItem(STORAGE_KEYS.FIXED_VEG_GRAMS);
      if (savedVegGrams) {
        setFixedVegetableGramsState(Number(savedVegGrams) || 200);
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
  }, []);

  // Salvataggio persistente ad ogni mutazione
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(plan));
      localStorage.setItem(STORAGE_KEYS.MENU_SELECTIONS, JSON.stringify(selections));
      localStorage.setItem(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchasedItems));
      localStorage.setItem(STORAGE_KEYS.WEEKS_COUNT, weeksCount.toString());
      localStorage.setItem(STORAGE_KEYS.FIXED_VEG, addFixedVegetables.toString());
      localStorage.setItem(STORAGE_KEYS.FIXED_VEG_GRAMS, fixedVegetableGrams.toString());
    } catch (e) {
      console.warn("Impossibile salvare su storage locale:", e);
    }
  }, [plan, selections, purchasedItems, weeksCount, addFixedVegetables, fixedVegetableGrams, isInitialized]);

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

  return {
    plan,
    selections,
    purchasedItems,
    weeksCount,
    addFixedVegetables,
    fixedVegetableGrams,
    isOnline,
    setOption,
    toggleFreeMeal,
    togglePurchased,
    setWeeksCount,
    setAddFixedVegetables,
    setFixedVegetableGrams,
    resetPurchased,
    updateCustomPlan,
  };
}
