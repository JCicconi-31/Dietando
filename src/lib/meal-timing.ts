import { Meal, MealType } from "@/types/diet";

/** Ora (0-24) entro cui ciascun pasto si considera "in corso o imminente". */
const MEAL_END_HOUR: Partial<Record<MealType, number>> = {
  COLAZIONE: 10.5,
  SPUNTINO_MATTINA: 12,
  PRANZO: 15,
  SPUNTINO_POMERIGGIO: 18.5,
  CENA: 22.5,
};

/**
 * Restituisce l'id del prossimo pasto della giornata in base all'ora corrente,
 * oppure null se la giornata è finita.
 */
export function getNextMealId(meals: Meal[], now: Date = new Date()): string | null {
  const hour = now.getHours() + now.getMinutes() / 60;
  const next = meals.find((m) => {
    const end = MEAL_END_HOUR[m.mealType];
    return end !== undefined && hour < end;
  });
  return next?.id ?? null;
}
