import { describe, it, expect } from "vitest";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import { Plan, MealSelection, Option } from "@/types/diet";
import { parseCustomFoodInput } from "./custom-food";
import { aggregateShoppingList } from "./shopping-list";
import { validateDietRules } from "./rules-validator";

describe("Custom Options & Shopping List Integration", () => {
  function clonePlan(base: Plan): Plan {
    return JSON.parse(JSON.stringify(base));
  }

  it("Scenario 1: creates custom option 'Primo Sale 100g' without incrementing free meals", () => {
    const testPlan = clonePlan(SAMPLE_PLAN);
    const parsed = parseCustomFoodInput("Primo Sale 100g");

    expect(parsed.name).toBe("Primo Sale");
    expect(parsed.amount).toBe(100);
    expect(parsed.unit).toBe("g");
    expect(parsed.department).toBe("Banco Frigo");
    expect(parsed.category).toBe("LATTICINI_UOVA");

    const lunedi = testPlan.days.find((d) => d.dayOfWeek === "LUNEDI")!;
    const pranzo = lunedi.meals.find((m) => m.mealType === "PRANZO")!;

    const customOption: Option = {
      id: "opt-custom-primo-sale",
      mealId: pranzo.id,
      name: parsed.name,
      orderIndex: pranzo.options.length,
      isCustom: true,
      type: "CUSTOM_SUBSTITUTION",
      isCheatMeal: false,
      ingredients: [
        {
          id: "oi-custom-1",
          ingredientId: "ing-custom-1",
          ingredient: {
            id: "ing-custom-1",
            name: parsed.name,
            category: parsed.category,
            department: parsed.department,
          },
          amount: parsed.amount,
          unit: parsed.unit,
        },
      ],
    };

    // Aggiungi customOption alle opzioni del pranzo
    pranzo.options.push(customOption);

    // Seleziona la nuova opzione personalizzata
    const selections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        selectedOptionId: customOption.id,
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    // Valida le regole: il contatore dei pasti liberi NON deve essere incrementato
    const ruleResults = validateDietRules(testPlan, selections);
    const freeMealRule = ruleResults.find((r) => r.type === "free_meals_limit");

    expect(freeMealRule).toBeDefined();
    expect(freeMealRule?.currentCount).toBe(0); // Nessun pasto libero conteggiato!
    expect(freeMealRule?.passed).toBe(true);
  });

  it("Scenario 2: synchronizes custom option to shopping list in correct department", () => {
    const testPlan = clonePlan(SAMPLE_PLAN);
    const lunedi = testPlan.days.find((d) => d.dayOfWeek === "LUNEDI")!;
    const pranzo = lunedi.meals.find((m) => m.mealType === "PRANZO")!;

    const customOption: Option = {
      id: "opt-custom-primo-sale",
      mealId: pranzo.id,
      name: "Primo Sale",
      orderIndex: pranzo.options.length,
      isCustom: true,
      type: "CUSTOM_SUBSTITUTION",
      isCheatMeal: false,
      ingredients: [
        {
          id: "oi-custom-1",
          ingredientId: "ing-custom-1",
          ingredient: {
            id: "ing-custom-1",
            name: "Primo Sale",
            category: "LATTICINI_UOVA",
            department: "Banco Frigo",
          },
          amount: 100,
          unit: "g",
        },
      ],
    };

    pranzo.options.push(customOption);

    const selections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        selectedOptionId: customOption.id,
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    const shoppingList = aggregateShoppingList(testPlan, selections, {
      selectedDays: ["LUNEDI"],
    });

    const bancoFrigoGroup = shoppingList.find((g) => g.department === "Banco Frigo");
    expect(bancoFrigoGroup).toBeDefined();

    const primoSaleItem = bancoFrigoGroup?.items.find((i) => i.name === "Primo Sale");
    expect(primoSaleItem).toBeDefined();
    expect(primoSaleItem?.rawAmount).toBe(100);
    expect(primoSaleItem?.rawUnit).toBe("g");
    expect(primoSaleItem?.displayAmount).toBe("100 g");
  });

  it("Scenario 3: deselecting or removing custom option removes it from shopping list", () => {
    const testPlan = clonePlan(SAMPLE_PLAN);
    const lunedi = testPlan.days.find((d) => d.dayOfWeek === "LUNEDI")!;
    const pranzo = lunedi.meals.find((m) => m.mealType === "PRANZO")!;
    const defaultOptionId = pranzo.options[0].id;

    const customOption: Option = {
      id: "opt-custom-primo-sale",
      mealId: pranzo.id,
      name: "Primo Sale",
      orderIndex: pranzo.options.length,
      isCustom: true,
      type: "CUSTOM_SUBSTITUTION",
      isCheatMeal: false,
      ingredients: [
        {
          id: "oi-custom-1",
          ingredientId: "ing-custom-1",
          ingredient: {
            id: "ing-custom-1",
            name: "Primo Sale",
            category: "LATTICINI_UOVA",
            department: "Banco Frigo",
          },
          amount: 100,
          unit: "g",
        },
      ],
    };

    pranzo.options.push(customOption);

    // 1. Caso deselezione: l'utente torna all'opzione originale del nutrizionista
    const deselectedSelections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        selectedOptionId: defaultOptionId,
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    const shoppingListAfterDeselect = aggregateShoppingList(testPlan, deselectedSelections, {
      selectedDays: ["LUNEDI"],
    });

    const allItemsDeselect = shoppingListAfterDeselect.flatMap((g) => g.items);
    expect(allItemsDeselect.some((i) => i.name === "Primo Sale")).toBe(false);

    // 2. Caso eliminazione: l'opzione custom viene rimossa da pranzo.options
    pranzo.options = pranzo.options.filter((o) => o.id !== customOption.id);

    const shoppingListAfterRemoval = aggregateShoppingList(testPlan, {}, {
      selectedDays: ["LUNEDI"],
    });

    const allItemsRemoved = shoppingListAfterRemoval.flatMap((g) => g.items);
    expect(allItemsRemoved.some((i) => i.name === "Primo Sale")).toBe(false);
  });

  it("scales custom option ingredients with weeksCount multiplier", () => {
    const testPlan = clonePlan(SAMPLE_PLAN);
    const lunedi = testPlan.days.find((d) => d.dayOfWeek === "LUNEDI")!;
    const pranzo = lunedi.meals.find((m) => m.mealType === "PRANZO")!;

    pranzo.options.push({
      id: "opt-custom-pollo",
      mealId: pranzo.id,
      name: "Petto di pollo",
      orderIndex: pranzo.options.length,
      isCustom: true,
      type: "CUSTOM_SUBSTITUTION",
      ingredients: [
        {
          id: "oi-custom-pollo",
          ingredientId: "ing-custom-pollo",
          ingredient: {
            id: "ing-custom-pollo",
            name: "Petto di pollo",
            category: "CARNE",
            department: "Macelleria",
          },
          amount: 200,
          unit: "g",
        },
      ],
    });

    const selections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        selectedOptionId: "opt-custom-pollo",
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    // 3 settimane
    const shoppingList = aggregateShoppingList(testPlan, selections, {
      weeksCount: 3,
      selectedDays: ["LUNEDI"],
    });

    const macelleria = shoppingList.find((g) => g.department === "Macelleria");
    const pollo = macelleria?.items.find((i) => i.name === "Petto di pollo");

    expect(pollo).toBeDefined();
    expect(pollo?.rawAmount).toBe(600); // 200g * 3 = 600g
    expect(pollo?.displayAmount).toBe("600 g");
  });
});
