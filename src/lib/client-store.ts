"use client";

import { useEffect, useState, useCallback } from "react";
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

export interface LocalDietState {
  plan: Plan | null;
  selections: Record<string, MealSelection>;
  purchasedItems: Record<string, boolean>;
  weeksCount: number;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  selectedShoppingDays: DayOfWeek[];
  isOnline: boolean;
  isInitialized: boolean;
  setOption: (dayOfWeek: string, mealType: string, optionId: string) => void;
  toggleFreeMeal: (dayOfWeek: string, mealType: string) => void;
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

export function useDietStore(userId?: string | null): LocalDietState {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selections, setSelections] = useState<Record<string, MealSelection>>({});
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});
  const [weeksCount, setWeeksCountState] = useState<number>(1);
  const [addFixedVegetables, setAddFixedVegetablesState] = useState<boolean>(false);
  const [fixedVegetableGrams, setFixedVegetableGramsState] = useState<number>(200);
  const [selectedShoppingDays, setSelectedShoppingDaysState] = useState<DayOfWeek[]>(ALL_DAYS);
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
    shoppingDays: `diet_shopping_days_${uid}`,
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

      const savedShoppingDays = localStorage.getItem(keys.shoppingDays);
      if (savedShoppingDays) {
        try {
          const parsedDays = JSON.parse(savedShoppingDays);
          if (Array.isArray(parsedDays) && parsedDays.length > 0) {
            setSelectedShoppingDaysState(parsedDays);
          } else {
            setSelectedShoppingDaysState(ALL_DAYS);
          }
        } catch {
          setSelectedShoppingDaysState(ALL_DAYS);
        }
      } else {
        setSelectedShoppingDaysState(ALL_DAYS);
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

    // Sincronizzazione multi-device cloud (PC <-> Telefono)
    if (userId) {
      fetch(`/api/diet/data?userId=${encodeURIComponent(userId)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            const remote = res.data;
            if (remote.plan) {
              setPlan(remote.plan);
              localStorage.setItem(keys.plan, JSON.stringify(remote.plan));
            }
            if (remote.selections && Object.keys(remote.selections).length > 0) {
              setSelections(remote.selections);
              localStorage.setItem(keys.selections, JSON.stringify(remote.selections));
            }
            if (remote.purchased) {
              setPurchasedItems(remote.purchased);
              localStorage.setItem(keys.purchased, JSON.stringify(remote.purchased));
            }
            if (remote.settings) {
              if (remote.settings.weeksCount) setWeeksCountState(remote.settings.weeksCount);
              if (remote.settings.addFixedVegetables !== undefined) setAddFixedVegetablesState(remote.settings.addFixedVegetables);
              if (remote.settings.fixedVegetableGrams) setFixedVegetableGramsState(remote.settings.fixedVegetableGrams);
              if (remote.settings.selectedShoppingDays) setSelectedShoppingDaysState(remote.settings.selectedShoppingDays);
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, getKeys]);

  // Salvataggio persistente ad ogni mutazione (locale + cloud debounced)
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
      localStorage.setItem(keys.shoppingDays, JSON.stringify(selectedShoppingDays));
    } catch (e) {
      console.warn("Impossibile salvare su storage locale:", e);
    }

    // Sync cloud debounced a PostgreSQL
    const syncTimer = setTimeout(() => {
      fetch("/api/diet/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          plan,
          selections,
          purchased: purchasedItems,
          settings: {
            weeksCount,
            addFixedVegetables,
            fixedVegetableGrams,
            selectedShoppingDays,
          },
        }),
      }).catch(() => {});
    }, 1200);

    return () => clearTimeout(syncTimer);
  }, [plan, selections, purchasedItems, weeksCount, addFixedVegetables, fixedVegetableGrams, selectedShoppingDays, isInitialized, userId, getKeys]);

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

  const setSelectedShoppingDays = (days: DayOfWeek[]) => {
    const sorted = ALL_DAYS.filter((d) => days.includes(d));
    setSelectedShoppingDaysState(sorted);
  };

  const toggleShoppingDay = (day: DayOfWeek) => {
    setSelectedShoppingDaysState((prev) => {
      let next: DayOfWeek[];
      if (prev.includes(day)) {
        next = prev.filter((d) => d !== day);
      } else {
        next = [...prev, day];
      }
      return ALL_DAYS.filter((d) => next.includes(d));
    });
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
      localStorage.removeItem(keys.shoppingDays);
    }
  };

  const loadSamplePlan = () => {
    setPlan(SAMPLE_PLAN);
    setSelections({});
    setPurchasedItems({});
  };

  const addCustomOption = useCallback(
    (
      dayOfWeek: DayOfWeek,
      mealType: MealType,
      customData: CustomOptionInput
    ): Option | null => {
      if (!plan) return null;

      const trimmedName = customData.name.trim();
      if (!trimmedName) return null;

      const inferred = inferCategoryAndDepartment(trimmedName);
      const category = customData.category || inferred.category || "ALTRO";
      const department = customData.department || inferred.department || "Banco Frigo";
      const amount =
        typeof customData.amount === "number" && customData.amount > 0
          ? customData.amount
          : inferred.defaultAmount || 100;
      const unit =
        customData.unit && customData.unit.trim()
          ? customData.unit.trim()
          : inferred.defaultUnit || "g";

      const optId = `custom-opt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const ingId = `custom-ing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      let createdOption: Option | null = null;

      const updatedDays = plan.days.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        const updatedMeals = day.meals.map((meal) => {
          if (meal.mealType !== mealType) return meal;

          createdOption = {
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
                ingredient: {
                  id: ingId,
                  name: trimmedName,
                  category,
                  department,
                },
                amount,
                unit,
                notes: customData.notes,
              },
            ],
          };

          return {
            ...meal,
            options: [...meal.options, createdOption!],
          };
        });

        return { ...day, meals: updatedMeals };
      });

      if (!createdOption) return null;

      setPlan({
        ...plan,
        days: updatedDays,
      });

      // Seleziona immediatamente l'opzione custom (FR-4) e imposta isFreeMeal a false
      const key = `${dayOfWeek}_${mealType}`;
      setSelections((prev) => ({
        ...prev,
        [key]: {
          dayOfWeek,
          mealType,
          selectedOptionId: optId,
          isFreeMeal: false,
          extraVegGrams: prev[key]?.extraVegGrams ?? 0,
        },
      }));

      return createdOption;
    },
    [plan]
  );

  const removeCustomOption = useCallback(
    (dayOfWeek: DayOfWeek, mealType: MealType, optionId: string) => {
      if (!plan) return;

      let fallbackOptionId: string | null = null;

      const updatedDays = plan.days.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        const updatedMeals = day.meals.map((meal) => {
          if (meal.mealType !== mealType) return meal;

          const remainingOptions = meal.options.filter((opt) => opt.id !== optionId);
          fallbackOptionId = remainingOptions[0]?.id || null;

          return {
            ...meal,
            options: remainingOptions,
          };
        });

        return { ...day, meals: updatedMeals };
      });

      setPlan({
        ...plan,
        days: updatedDays,
      });

      // Se l'opzione rimossa era selezionata, ripristina la prima opzione disponibile
      const key = `${dayOfWeek}_${mealType}`;
      setSelections((prev) => {
        const current = prev[key];
        if (current?.selectedOptionId === optionId) {
          return {
            ...prev,
            [key]: {
              ...current,
              selectedOptionId: fallbackOptionId,
              isFreeMeal: false,
            },
          };
        }
        return prev;
      });
    },
    [plan]
  );

  return {
    plan,
    selections,
    purchasedItems,
    weeksCount,
    addFixedVegetables,
    fixedVegetableGrams,
    selectedShoppingDays,
    isOnline,
    isInitialized,
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
