import { describe, it, expect } from "vitest";
import {
  aggregateShoppingList,
  convertUnit,
  formatAmountNumber,
  formatShoppingListAsText,
  getNextNDays,
} from "./shopping-list";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import { MealSelection } from "@/types/diet";

describe("Shopping List Unit Conversion & Formatting", () => {
  it("formats numbers cleanly without trailing zeros", () => {
    expect(formatAmountNumber(100)).toBe("100");
    expect(formatAmountNumber(1.5)).toBe("1.5");
    expect(formatAmountNumber(1.25)).toBe("1.25");
    expect(formatAmountNumber(1.20001)).toBe("1.2");
  });

  it("converts grams to kilograms when >= 1000", () => {
    expect(convertUnit(500, "g")).toEqual({
      convertedAmount: 500,
      convertedUnit: "g",
      displayAmount: "500 g",
    });

    expect(convertUnit(1000, "g")).toEqual({
      convertedAmount: 1,
      convertedUnit: "kg",
      displayAmount: "1 kg",
    });

    expect(convertUnit(1250, "g")).toEqual({
      convertedAmount: 1.25,
      convertedUnit: "kg",
      displayAmount: "1.25 kg",
    });

    expect(convertUnit(2000, "grammi")).toEqual({
      convertedAmount: 2,
      convertedUnit: "kg",
      displayAmount: "2 kg",
    });
  });

  it("converts milliliters to liters when >= 1000", () => {
    expect(convertUnit(400, "ml")).toEqual({
      convertedAmount: 400,
      convertedUnit: "ml",
      displayAmount: "400 ml",
    });

    expect(convertUnit(1000, "ml")).toEqual({
      convertedAmount: 1,
      convertedUnit: "l",
      displayAmount: "1 l",
    });

    expect(convertUnit(1500, "ml")).toEqual({
      convertedAmount: 1.5,
      convertedUnit: "l",
      displayAmount: "1.5 l",
    });
  });

  it("preserves discrete units (pezzi, fette)", () => {
    expect(convertUnit(4, "fette")).toEqual({
      convertedAmount: 4,
      convertedUnit: "fette",
      displayAmount: "4 fette",
    });
    expect(convertUnit(6, "pezzi")).toEqual({
      convertedAmount: 6,
      convertedUnit: "pezzi",
      displayAmount: "6 pezzi",
    });
  });
});

describe("Shopping List Aggregator Logic", () => {
  it("aggregates ingredients correctly for 1 week with default options", () => {
    const result = aggregateShoppingList(SAMPLE_PLAN, {});

    // Must return departments
    expect(result.length).toBeGreaterThan(0);

    // Look for Banco Frigo
    const bancoFrigo = result.find((d) => d.department === "Banco Frigo");
    expect(bancoFrigo).toBeDefined();

    // Check yogurt greco sum across the week
    const yogurt = bancoFrigo?.items.find((i) => i.name.includes("Yogurt greco 0%"));
    expect(yogurt).toBeDefined();
    // Monday (170) + Wednesday (170) + Thursday (170) + Friday (150) + Saturday (170) = 830g
    expect(yogurt?.rawAmount).toBe(830);
    expect(yogurt?.displayAmount).toBe("830 g");
  });

  it("scales amounts proportionally for N weeks and converts to kg when exceeding 1000g", () => {
    // For 2 weeks, 830g * 2 = 1660g -> 1.66 kg
    const result2Weeks = aggregateShoppingList(SAMPLE_PLAN, {}, { weeksCount: 2 });
    const bancoFrigo2 = result2Weeks.find((d) => d.department === "Banco Frigo");
    const yogurt2 = bancoFrigo2?.items.find((i) => i.name.includes("Yogurt greco 0%"));

    expect(yogurt2?.rawAmount).toBe(1660);
    expect(yogurt2?.displayAmount).toBe("1.66 kg");

    // For 3 weeks, 830g * 3 = 2490g -> 2.49 kg
    const result3Weeks = aggregateShoppingList(SAMPLE_PLAN, {}, { weeksCount: 3 });
    const bancoFrigo3 = result3Weeks.find((d) => d.department === "Banco Frigo");
    const yogurt3 = bancoFrigo3?.items.find((i) => i.name.includes("Yogurt greco 0%"));

    expect(yogurt3?.rawAmount).toBe(2490);
    expect(yogurt3?.displayAmount).toBe("2.49 kg");
  });

  it("excludes ingredients when a meal is marked as free meal (pasto libero)", () => {
    // Monday lunch has tonno (112g) and pasta (80g)
    const baseResult = aggregateShoppingList(SAMPLE_PLAN, {});
    const dispensa = baseResult.find((d) => d.department === "Dispensa e Cereali");
    const tonnoBase = dispensa?.items.find((i) => i.name === "Tonno al naturale");
    expect(tonnoBase?.rawAmount).toBe(112);

    // Mark Monday lunch as free meal
    const selections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        isFreeMeal: true,
        extraVegGrams: 0,
      },
    };

    const freeResult = aggregateShoppingList(SAMPLE_PLAN, selections);
    const dispensaFree = freeResult.find((d) => d.department === "Dispensa e Cereali");
    const tonnoFree = dispensaFree?.items.find((i) => i.name === "Tonno al naturale");
    expect(tonnoFree).toBeUndefined();
  });

  it("properly swaps ingredients when selecting an alternative option", () => {
    // Default Monday lunch is Option 1 (Tonno 112g, Pasta 80g)
    // Option 2 is Riso basmati 80g + Petto di pollo 150g + Peperoni 200g
    const selections: Record<string, MealSelection> = {
      LUNEDI_PRANZO: {
        dayOfWeek: "LUNEDI",
        mealType: "PRANZO",
        selectedOptionId: "opt-lun-pranzo-2",
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    const result = aggregateShoppingList(SAMPLE_PLAN, selections);

    // Tonno from lunch should not be present
    const dispensa = result.find((d) => d.department === "Dispensa e Cereali");
    const tonno = dispensa?.items.find((i) => i.name === "Tonno al naturale");
    expect(tonno).toBeUndefined();

    // Peperoni (200g) should now be in Ortofrutta
    const ortofrutta = result.find((d) => d.department === "Ortofrutta");
    const peperoni = ortofrutta?.items.find((i) => i.name === "Peperoni");
    expect(peperoni).toBeDefined();
    expect(peperoni?.rawAmount).toBe(200);
  });

  it("adds fixed vegetables to main meals when option is enabled", () => {
    // With 7 days, lunches and dinners (excluding Saturday dinner which is naturally empty/pasto libero)
    // 7 lunches + 6 dinners = 13 main meals * 200g = 2600g -> 2.6 kg
    const result = aggregateShoppingList(
      SAMPLE_PLAN,
      {},
      { addFixedVegetables: true, fixedVegetableGrams: 200 }
    );

    const ortofrutta = result.find((d) => d.department === "Ortofrutta");
    const extraVeg = ortofrutta?.items.find((i) => i.name === "Verdure di stagione a scelta");

    expect(extraVeg).toBeDefined();
    // 14 main meals (7 lunch + 7 dinner). Saturday dinner has 0 extra veg if marked free, or if not marked free it has extra veg.
    expect(extraVeg?.rawAmount).toBeGreaterThanOrEqual(2000);
    expect(extraVeg?.displayAmount).toContain("kg");
  });

  it("marks items as purchased when present in purchasedItems map", () => {
    const sampleItemKey = "mela:::pezzi";
    const result = aggregateShoppingList(
      SAMPLE_PLAN,
      {},
      {
        purchasedItems: {
          [sampleItemKey]: true,
        },
      }
    );

    const ortofrutta = result.find((d) => d.department === "Ortofrutta");
    const mela = ortofrutta?.items.find((i) => i.name === "Mela");
    expect(mela).toBeDefined();
    expect(mela?.isPurchased).toBe(true);
  });

  it("formats text correctly for copying to clipboard", () => {
    const list = aggregateShoppingList(SAMPLE_PLAN, {});
    const text = formatShoppingListAsText(list, 1);

    expect(text).toContain("🛒 LISTA DELLA SPESA (1 settimana)");
    expect(text).toContain("[ORTOFRUTTA]");
    expect(text).toContain("[BANCO FRIGO]");
    expect(text).toContain("Yogurt greco 0%");
  });

  it("calculates next N days cyclically with getNextNDays", () => {
    expect(getNextNDays("LUNEDI", 3)).toEqual(["LUNEDI", "MARTEDI", "MERCOLEDI"]);
    expect(getNextNDays("SABATO", 3)).toEqual(["SABATO", "DOMENICA", "LUNEDI"]);
    expect(getNextNDays("DOMENICA", 2)).toEqual(["DOMENICA", "LUNEDI"]);
    expect(getNextNDays("VENERDI", 4)).toEqual(["VENERDI", "SABATO", "DOMENICA", "LUNEDI"]);
  });

  it("aggregates only selected days when selectedDays option is provided", () => {
    // Aggregation for only Monday and Tuesday
    const twoDaysResult = aggregateShoppingList(SAMPLE_PLAN, {}, {
      selectedDays: ["LUNEDI", "MARTEDI"],
    });

    expect(twoDaysResult.length).toBeGreaterThan(0);

    // Monday has 170g Yogurt, Tuesday breakfast has 200ml latte (no yogurt)
    const bancoFrigo = twoDaysResult.find((d) => d.department === "Banco Frigo");
    const yogurt = bancoFrigo?.items.find((i) => i.name.includes("Yogurt greco 0%"));
    expect(yogurt?.rawAmount).toBe(170); // Only Monday, not the whole week (830g)

    // Wednesday lunch has salmone, which should NOT be in 2-days list
    const pescheria = twoDaysResult.find((d) => d.department === "Pescheria");
    const salmone = pescheria?.items.find((i) => i.name.includes("Salmone"));
    expect(salmone).toBeUndefined();
  });

  it("returns empty list if selectedDays is an empty array", () => {
    const emptyResult = aggregateShoppingList(SAMPLE_PLAN, {}, {
      selectedDays: [],
    });
    expect(emptyResult).toEqual([]);
  });

  it("formats text title correctly when custom days are selected", () => {
    const list = aggregateShoppingList(SAMPLE_PLAN, {}, {
      selectedDays: ["LUNEDI", "MARTEDI", "MERCOLEDI"],
    });
    const text = formatShoppingListAsText(list, 1, ["LUNEDI", "MARTEDI", "MERCOLEDI"]);

    expect(text).toContain("🛒 LISTA DELLA SPESA (3 giorni (Lun, Mar, Mer))");
  });
});
