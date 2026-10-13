import { describe, it, expect } from "vitest";
import { parseCustomFoodInput, inferCategoryAndDepartment } from "./custom-food";

describe("custom-food helper", () => {
  it("parses 'Primo Sale 100g' correctly with department and category", () => {
    const result = parseCustomFoodInput("Primo Sale 100g");
    expect(result.name).toBe("Primo Sale");
    expect(result.amount).toBe(100);
    expect(result.unit).toBe("g");
    expect(result.category).toBe("LATTICINI_UOVA");
    expect(result.department).toBe("Banco Frigo");
  });

  it("parses 'Formaggio Primo Sale 150 g'", () => {
    const result = parseCustomFoodInput("Formaggio Primo Sale 150 g");
    expect(result.name).toBe("Formaggio Primo Sale");
    expect(result.amount).toBe(150);
    expect(result.unit).toBe("g");
    expect(result.category).toBe("LATTICINI_UOVA");
    expect(result.department).toBe("Banco Frigo");
  });

  it("parses 'Petto di pollo 200g' correctly", () => {
    const result = parseCustomFoodInput("Petto di pollo 200g");
    expect(result.name).toBe("Petto di pollo");
    expect(result.amount).toBe(200);
    expect(result.unit).toBe("g");
    expect(result.category).toBe("CARNE");
    expect(result.department).toBe("Macelleria");
  });

  it("parses '2 uova' prefix format", () => {
    const result = parseCustomFoodInput("2 uova");
    expect(result.name).toBe("Uova");
    expect(result.amount).toBe(2);
    expect(result.unit).toBe("pezzi");
    expect(result.category).toBe("LATTICINI_UOVA");
    expect(result.department).toBe("Banco Frigo");
  });

  it("parses 'Latte 250ml' liquid format", () => {
    const result = parseCustomFoodInput("Latte 250ml");
    expect(result.name).toBe("Latte");
    expect(result.amount).toBe(250);
    expect(result.unit).toBe("ml");
    expect(result.category).toBe("LATTICINI_UOVA");
    expect(result.department).toBe("Banco Frigo");
  });

  it("parses 'Salmone 180 gr' with gr abbreviation", () => {
    const result = parseCustomFoodInput("Salmone 180 gr");
    expect(result.name).toBe("Salmone");
    expect(result.amount).toBe(180);
    expect(result.unit).toBe("g");
    expect(result.category).toBe("PESCE");
    expect(result.department).toBe("Pescheria");
  });

  it("handles plain food name without amount with sensible defaults", () => {
    const result = parseCustomFoodInput("Primo Sale");
    expect(result.name).toBe("Primo Sale");
    expect(result.amount).toBe(100);
    expect(result.unit).toBe("g");
    expect(result.category).toBe("LATTICINI_UOVA");
    expect(result.department).toBe("Banco Frigo");
  });

  it("falls back to Banco Frigo / Altro if unknown item", () => {
    const result = inferCategoryAndDepartment("Alimento Misterioso");
    expect(result.department).toBe("Banco Frigo");
    expect(result.category).toBe("ALTRO");
  });
});
