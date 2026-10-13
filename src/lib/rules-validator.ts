import { Plan, MealSelection, Rule } from "@/types/diet";

export interface RuleValidationResult {
  ruleId: string;
  type: string;
  passed: boolean;
  severity: "info" | "warning" | "success";
  message: string;
  currentCount: number;
  threshold?: number;
  category?: string;
}

/**
 * Controlla se un ingrediente rientra nelle eccezioni della regola (es. "prosciutto crudo")
 */
function isIngredientException(ingredientName: string, exceptions?: string[]): boolean {
  if (!exceptions || exceptions.length === 0) return false;
  const nameNorm = ingredientName.toLowerCase().trim();
  return exceptions.some((exc) => nameNorm.includes(exc.toLowerCase().trim()));
}

/**
 * Valida il menu settimanale rispetto alle regole definite nel piano (regole come dati)
 */
export function validateDietRules(
  plan: Plan,
  selections: Record<string, MealSelection> = {}
): RuleValidationResult[] {
  const results: RuleValidationResult[] = [];

  // Mappa delle frequenze per categoria: categoria -> conteggio pasti distinti
  const categoryMealCounts = new Map<string, number>();
  let freeMealsCount = 0;
  let totalMealsEvaluated = 0;

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const selectionKey = `${day.dayOfWeek}_${meal.mealType}`;
      const selection = selections[selectionKey];
      totalMealsEvaluated++;

      if (selection?.isFreeMeal) {
        freeMealsCount++;
        continue;
      }

      // Trova l'opzione attiva
      let activeOption = meal.options[0];
      if (selection?.selectedOptionId) {
        const found = meal.options.find((opt) => opt.id === selection.selectedOptionId);
        if (found) {
          activeOption = found;
        }
      }

      if (!activeOption) continue;

      // Categorie presenti in questo pasto (usiamo un set per non contare due volte la stessa categoria in un singolo pasto)
      const categoriesInMeal = new Set<string>();

      for (const optIng of activeOption.ingredients) {
        const cat = optIng.ingredient.category;
        const ingName = optIng.ingredient.name;

        // Verifica eccezioni per ciascuna regola legata a questa categoria
        const matchingRules = plan.rules.filter((r) => r.targetCategory === cat);
        const hasException = matchingRules.some((r) =>
          isIngredientException(ingName, r.exceptions)
        );

        if (!hasException) {
          categoriesInMeal.add(cat);
        }
      }

      for (const cat of categoriesInMeal) {
        categoryMealCounts.set(cat, (categoryMealCounts.get(cat) || 0) + 1);
      }
    }
  }

  // Valuta ciascuna regola presente nel piano
  for (const rule of plan.rules) {
    if (rule.type === "free_meals_limit") {
      const maxAllowed = rule.max ?? 2;
      const passed = freeMealsCount <= maxAllowed;
      results.push({
        ruleId: rule.id,
        type: rule.type,
        passed,
        severity: passed ? "success" : "warning",
        currentCount: freeMealsCount,
        threshold: maxAllowed,
        message: passed
          ? `Pasti liberi: ${freeMealsCount} di ${maxAllowed} consentiti.`
          : `Attenzione: hai scelto ${freeMealsCount} pasti liberi, il piano ne ammette al massimo ${maxAllowed}.`,
      });
      continue;
    }

    if (rule.type === "max_per_week" && rule.targetCategory) {
      const count = categoryMealCounts.get(rule.targetCategory) || 0;
      const maxAllowed = rule.max ?? 3;
      const passed = count <= maxAllowed;
      const catLabel = rule.targetCategory.toLowerCase();

      results.push({
        ruleId: rule.id,
        type: rule.type,
        passed,
        severity: passed ? "success" : "warning",
        category: rule.targetCategory,
        currentCount: count,
        threshold: maxAllowed,
        message: passed
          ? `${catLabel.toUpperCase()}: ${count} su ${maxAllowed} pasti max consentiti.`
          : `Attenzione: hai scelto ${count} volte ${catLabel}, il piano ne ammette al massimo ${maxAllowed}.`,
      });
      continue;
    }

    if (rule.type === "min_per_week" && rule.targetCategory) {
      const count = categoryMealCounts.get(rule.targetCategory) || 0;
      const minRequired = rule.min ?? 3;
      const passed = count >= minRequired;
      const catLabel = rule.targetCategory.toLowerCase();

      results.push({
        ruleId: rule.id,
        type: rule.type,
        passed,
        severity: passed ? "success" : "warning",
        category: rule.targetCategory,
        currentCount: count,
        threshold: minRequired,
        message: passed
          ? `${catLabel.toUpperCase()}: ${count} pasti (obiettivo minimo di ${minRequired} raggiunto).`
          : `Attenzione: hai programmato solo ${count} pasti con ${catLabel}, il piano ne raccomanda almeno ${minRequired}.`,
      });
      continue;
    }
  }

  return results;
}
