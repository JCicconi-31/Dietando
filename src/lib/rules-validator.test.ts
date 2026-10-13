import { describe, it, expect } from "vitest";
import { validateDietRules } from "./rules-validator";
import { SAMPLE_PLAN } from "@/data/sample-plan";
import { Plan, MealSelection } from "@/types/diet";

describe("Diet Rules Validator Engine", () => {
  it("validates compliant menu under max thresholds", () => {
    // In sample plan with default options:
    // Affettati max 3: Bresaola is in Monday dinner (opt 2), but default option 1 is Orata.
    // So affettati count is 0. Rule passes.
    const results = validateDietRules(SAMPLE_PLAN, {});

    const affettatiRule = results.find((r) => r.category === "AFFETTATI");
    expect(affettatiRule).toBeDefined();
    expect(affettatiRule?.passed).toBe(true);
    expect(affettatiRule?.currentCount).toBe(0);
  });

  it("triggers warning when category exceeds max_per_week", () => {
    // Let's create mock selections where affettati is chosen 4 times in a week
    const selections: Record<string, MealSelection> = {
      // Monday dinner opt 2: Bresaola
      LUNEDI_CENA: {
        dayOfWeek: "LUNEDI",
        mealType: "CENA",
        selectedOptionId: "opt-lun-cena-2",
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    // Create a plan with a strict rule of max 0 affettati
    const strictPlan: Plan = {
      ...SAMPLE_PLAN,
      rules: [
        {
          id: "rule-strict-affettati",
          planId: "sample",
          type: "max_per_week",
          targetCategory: "AFFETTATI",
          max: 0,
          description: "Nessun affettato concesso",
        },
      ],
    };

    const results = validateDietRules(strictPlan, selections);
    const ruleRes = results.find((r) => r.ruleId === "rule-strict-affettati");

    expect(ruleRes).toBeDefined();
    expect(ruleRes?.passed).toBe(false);
    expect(ruleRes?.severity).toBe("warning");
    expect(ruleRes?.currentCount).toBe(1);
    expect(ruleRes?.message).toContain("il piano ne ammette al massimo 0");
  });

  it("handles exceptions correctly (e.g., prosciutto crudo escluso dal limite affettati)", () => {
    // Wednesday dinner option 2 has Prosciutto crudo
    const selections: Record<string, MealSelection> = {
      MERCOLEDI_CENA: {
        dayOfWeek: "MERCOLEDI",
        mealType: "CENA",
        selectedOptionId: "opt-mer-cena-2", // Prosciutto crudo di Parma
        isFreeMeal: false,
        extraVegGrams: 0,
      },
    };

    // Rule 1 in SAMPLE_PLAN has exceptions: ["Prosciutto crudo", "prosciutto crudo"]
    const results = validateDietRules(SAMPLE_PLAN, selections);
    const affettatiRule = results.find((r) => r.category === "AFFETTATI");

    // Prosciutto crudo is excluded by rule exception, so count remains 0!
    expect(affettatiRule?.currentCount).toBe(0);
    expect(affettatiRule?.passed).toBe(true);
  });

  it("detects when min_per_week requirement is met or unmet", () => {
    // Fish (PESCE) rule requires min 3 per week
    // In default plan:
    // Lunedi pranzo: Tonno (opt 1) -> 1
    // Lunedi cena: Orata (opt 1) -> 2
    // Martedi pranzo: Farro e salmone affumicato (opt 2 is not default, opt 1 is Ceci) -> 0
    // Mercoledi cena: Merluzzo (opt 1) -> 3
    // Giovedi pranzo: Salmone fresco (opt 1) -> 4
    // Venerdi cena: Calamari (opt 1) -> 5
    // Domenica cena: Platessa (opt 1) -> 6
    const results = validateDietRules(SAMPLE_PLAN, {});
    const fishRule = results.find((r) => r.category === "PESCE");

    expect(fishRule).toBeDefined();
    expect(fishRule?.passed).toBe(true);
    expect(fishRule?.currentCount).toBeGreaterThanOrEqual(3);
  });

  it("warns when free meals exceed free_meals_limit", () => {
    // Mark 3 meals as free meal when rule allows max 2
    const selections: Record<string, MealSelection> = {
      VENERDI_CENA: {
        dayOfWeek: "VENERDI",
        mealType: "CENA",
        isFreeMeal: true,
        extraVegGrams: 0,
      },
      SABATO_PRANZO: {
        dayOfWeek: "SABATO",
        mealType: "PRANZO",
        isFreeMeal: true,
        extraVegGrams: 0,
      },
      SABATO_CENA: {
        dayOfWeek: "SABATO",
        mealType: "CENA",
        isFreeMeal: true,
        extraVegGrams: 0,
      },
    };

    const results = validateDietRules(SAMPLE_PLAN, selections);
    const freeMealsRule = results.find((r) => r.type === "free_meals_limit");

    expect(freeMealsRule).toBeDefined();
    expect(freeMealsRule?.passed).toBe(false);
    expect(freeMealsRule?.currentCount).toBe(3);
    expect(freeMealsRule?.message).toContain("hai scelto 3 pasti liberi");
  });
});
