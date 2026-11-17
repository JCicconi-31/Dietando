import { describe, it, expect } from "vitest";
import { getNextMealId } from "./meal-timing";
import { SAMPLE_PLAN } from "@/data/sample-plan";

const meals = SAMPLE_PLAN.days[0].meals;
const at = (h: number, m = 0) => new Date(2026, 10, 17, h, m);
const idOf = (type: string) => meals.find((m) => m.mealType === type)?.id;

describe("getNextMealId", () => {
  it("picks breakfast early in the morning", () => {
    expect(getNextMealId(meals, at(7))).toBe(idOf("COLAZIONE"));
  });

  it("picks lunch around midday", () => {
    expect(getNextMealId(meals, at(13, 30))).toBe(idOf("PRANZO"));
  });

  it("picks dinner in the evening", () => {
    expect(getNextMealId(meals, at(20))).toBe(idOf("CENA"));
  });

  it("returns null late at night", () => {
    expect(getNextMealId(meals, at(23, 30))).toBeNull();
  });
});
