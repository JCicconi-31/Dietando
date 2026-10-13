import {
  Plan,
  MealSelection,
  AggregatedShoppingItem,
  DepartmentShoppingGroup,
  IngredientCategory,
} from "@/types/diet";

export interface AggregateOptions {
  weeksCount?: number;
  addFixedVegetables?: boolean;
  fixedVegetableGrams?: number;
  purchasedItems?: Record<string, boolean>;
}

// Ordine standard dei reparti del supermercato per la spesa
export const DEPARTMENT_ORDER = [
  "Ortofrutta",
  "Banco Frigo",
  "Macelleria",
  "Pescheria",
  "Dispensa e Cereali",
  "Condimenti e Spezie",
  "Surgelati",
  "Altro",
];

/**
 * Formatta un numero rimuovendo gli zeri decimali superflui (es. 1.50 -> 1.5, 2.00 -> 2)
 */
export function formatAmountNumber(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Converte le quantità in unità superiori se >= 1000 (g -> kg, ml -> l)
 */
export function convertUnit(
  amount: number,
  unit: string
): { displayAmount: string; convertedAmount: number; convertedUnit: string } {
  const normUnit = unit.trim().toLowerCase();

  if ((normUnit === "g" || normUnit === "grammi") && amount >= 1000) {
    const inKg = amount / 1000;
    return {
      convertedAmount: inKg,
      convertedUnit: "kg",
      displayAmount: `${formatAmountNumber(inKg)} kg`,
    };
  }

  if ((normUnit === "ml" || normUnit === "millilitri") && amount >= 1000) {
    const inL = amount / 1000;
    return {
      convertedAmount: inL,
      convertedUnit: "l",
      displayAmount: `${formatAmountNumber(inL)} l`,
    };
  }

  return {
    convertedAmount: amount,
    convertedUnit: unit,
    displayAmount: `${formatAmountNumber(amount)} ${unit}`,
  };
}

/**
 * Normalizza la chiave per raggruppare lo stesso ingrediente con la stessa unità base
 */
function createItemKey(name: string, unit: string): string {
  return `${name.trim().toLowerCase()}:::${unit.trim().toLowerCase()}`;
}

/**
 * Aggrega gli ingredienti della lista della spesa per il menu settimanale selezionato
 */
export function aggregateShoppingList(
  plan: Plan,
  selections: Record<string, MealSelection> = {},
  options: AggregateOptions = {}
): DepartmentShoppingGroup[] {
  const weeksCount = Math.max(1, options.weeksCount || 1);
  const addFixedVegetables = options.addFixedVegetables ?? false;
  const fixedVegetableGrams = options.fixedVegetableGrams ?? 200;
  const purchasedItems = options.purchasedItems || {};

  // Mappa temporanea: itemKey -> AggregatedShoppingItem accumulatore
  const accumulator = new Map<
    string,
    {
      name: string;
      category: IngredientCategory;
      department: string;
      rawAmount: number;
      rawUnit: string;
    }
  >();

  // Itera sui giorni del piano
  for (const day of plan.days) {
    for (const meal of day.meals) {
      const selectionKey = `${day.dayOfWeek}_${meal.mealType}`;
      const selection = selections[selectionKey];

      // Se il pasto è segnato come pasto libero, è escluso dalla spesa
      if (selection?.isFreeMeal) {
        continue;
      }

      // Seleziona l'opzione (se indicata, altrimenti la prima opzione di default)
      let selectedOption = meal.options[0];
      if (selection?.selectedOptionId) {
        const found = meal.options.find((opt) => opt.id === selection.selectedOptionId);
        if (found) {
          selectedOption = found;
        }
      }

      // Se non ci sono opzioni o ingredienti, salta
      if (!selectedOption) continue;

      // Accumula gli ingredienti dell'opzione scelta
      for (const optIng of selectedOption.ingredients) {
        const key = createItemKey(optIng.ingredient.name, optIng.unit);
        const addedAmount = optIng.amount * weeksCount;

        const existing = accumulator.get(key);
        if (existing) {
          existing.rawAmount += addedAmount;
        } else {
          accumulator.set(key, {
            name: optIng.ingredient.name,
            category: optIng.ingredient.category,
            department: optIng.ingredient.department || "Altro",
            rawAmount: addedAmount,
            rawUnit: optIng.unit,
          });
        }
      }

      // Gestione opzione "quantità fissa di verdure ai pasti principali" (Pranzo e Cena)
      const isMainMeal = meal.mealType === "PRANZO" || meal.mealType === "CENA";
      const extraGrams = selection?.extraVegGrams ?? (addFixedVegetables ? fixedVegetableGrams : 0);

      if (isMainMeal && extraGrams > 0) {
        const vegKey = createItemKey("Verdure di stagione a scelta", "g");
        const addedVegAmount = extraGrams * weeksCount;

        const existing = accumulator.get(vegKey);
        if (existing) {
          existing.rawAmount += addedVegAmount;
        } else {
          accumulator.set(vegKey, {
            name: "Verdure di stagione a scelta",
            category: "VERDURA",
            department: "Ortofrutta",
            rawAmount: addedVegAmount,
            rawUnit: "g",
          });
        }
      }
    }
  }

  // Costruisci lista degli elementi aggregati con conversione unità e stato comprato
  const items: AggregatedShoppingItem[] = Array.from(accumulator.entries()).map(([key, data]) => {
    const { displayAmount } = convertUnit(data.rawAmount, data.rawUnit);
    return {
      itemKey: key,
      name: data.name,
      category: data.category,
      department: data.department,
      rawAmount: data.rawAmount,
      rawUnit: data.rawUnit,
      displayAmount,
      isPurchased: Boolean(purchasedItems[key]),
    };
  });

  // Raggruppa per reparto
  const departmentMap = new Map<string, AggregatedShoppingItem[]>();

  for (const item of items) {
    const dept = item.department || "Altro";
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, []);
    }
    departmentMap.get(dept)!.push(item);
  }

  // Ordina gli elementi per nome alfabetico all'interno di ciascun reparto
  for (const list of departmentMap.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "it"));
  }

  // Ordina i reparti secondo l'ordine standard logico del supermercato
  const sortedDepartments: DepartmentShoppingGroup[] = [];

  for (const dept of DEPARTMENT_ORDER) {
    if (departmentMap.has(dept)) {
      sortedDepartments.push({
        department: dept,
        items: departmentMap.get(dept)!,
      });
      departmentMap.delete(dept);
    }
  }

  // Aggiungi eventuali reparti personalizzati rimasti
  for (const [dept, deptItems] of departmentMap.entries()) {
    sortedDepartments.push({
      department: dept,
      items: deptItems,
    });
  }

  return sortedDepartments;
}

/**
 * Genera il testo formattato da copiare negli appunti con il pulsante "Copia lista"
 */
export function formatShoppingListAsText(
  groups: DepartmentShoppingGroup[],
  weeksCount: number = 1
): string {
  const weeksLabel = weeksCount === 1 ? "1 settimana" : `${weeksCount} settimane`;
  const lines: string[] = [`🛒 LISTA DELLA SPESA (${weeksLabel})`, ""];

  for (const group of groups) {
    if (group.items.length === 0) continue;

    lines.push(`📦 [${group.department.toUpperCase()}]`);
    for (const item of group.items) {
      const check = item.isPurchased ? "✅" : "▫️";
      lines.push(`  ${check} ${item.name}: ${item.displayAmount}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
