import { z } from "zod";

export const DayOfWeekSchema = z.enum([
  "LUNEDI",
  "MARTEDI",
  "MERCOLEDI",
  "GIOVEDI",
  "VENERDI",
  "SABATO",
  "DOMENICA",
]);

export const MealTypeSchema = z.enum([
  "COLAZIONE",
  "SPUNTINO_MATTINA",
  "PRANZO",
  "SPUNTINO_POMERIGGIO",
  "CENA",
  "ALTRO",
]);

export const IngredientCategorySchema = z.enum([
  "VERDURA",
  "FRUTTA",
  "CARNE",
  "PESCE",
  "AFFETTATI",
  "LATTICINI_UOVA",
  "CEREALI_PASTA_PANE",
  "LEGUMI",
  "CONDIMENTI_OLIO",
  "BEVANDE_SNACK",
  "SURGELATI",
  "ALTRO",
]);

export const IngredientSchema = z.object({
  id: z.string().optional().default(() => `ing-${Math.random().toString(36).substring(2, 9)}`),
  name: z.string().min(1, "Il nome dell'ingrediente è obbligatorio"),
  category: IngredientCategorySchema.default("ALTRO"),
  department: z.string().default("Altro"),
});

export const OptionIngredientSchema = z.object({
  id: z.string().optional().default(() => `oi-${Math.random().toString(36).substring(2, 9)}`),
  ingredientId: z.string().optional().default(() => `ing-${Math.random().toString(36).substring(2, 9)}`),
  ingredient: IngredientSchema,
  amount: z.number().nonnegative("La quantità deve essere un numero positivo"),
  unit: z.string().min(1, "L'unità di misura è obbligatoria (es. g, ml, pezzi, fette)"),
  notes: z.string().optional(),
});

export const OptionSchema = z.object({
  id: z.string().optional().default(() => `opt-${Math.random().toString(36).substring(2, 9)}`),
  mealId: z.string().optional().default(""),
  name: z.string().min(1, "Il nome dell'opzione è obbligatorio"),
  orderIndex: z.number().int().default(0),
  isCustom: z.boolean().optional(),
  type: z.string().optional(),
  isCheatMeal: z.boolean().optional(),
  ingredients: z.array(OptionIngredientSchema).default([]),
});

export const MealSchema = z.object({
  id: z.string().optional().default(() => `meal-${Math.random().toString(36).substring(2, 9)}`),
  dayId: z.string().optional().default(""),
  mealType: MealTypeSchema,
  name: z.string().min(1, "Il nome del pasto è obbligatorio"),
  orderIndex: z.number().int().default(0),
  options: z.array(OptionSchema).min(1, "Ogni pasto deve avere almeno un'opzione"),
});

export const DayPlanSchema = z.object({
  id: z.string().optional().default(() => `day-${Math.random().toString(36).substring(2, 9)}`),
  planId: z.string().optional().default(""),
  dayOfWeek: DayOfWeekSchema,
  orderIndex: z.number().int().default(0),
  meals: z.array(MealSchema),
});

export const RuleSchema = z.object({
  id: z.string().optional().default(() => `rule-${Math.random().toString(36).substring(2, 9)}`),
  planId: z.string().optional().default(""),
  type: z.string(), // "max_per_week" | "min_per_week" | "free_meals_limit"
  targetCategory: z.string().optional(),
  max: z.number().optional(),
  min: z.number().optional(),
  description: z.string().min(1, "La descrizione della regola è obbligatoria"),
  exceptions: z.array(z.string()).optional(),
});

export const PlanImportSchema = z.object({
  id: z.string().optional().default(() => `plan-${Math.random().toString(36).substring(2, 9)}`),
  userId: z.string().optional().default("user-custom"),
  title: z.string().min(1, "Il titolo del piano è obbligatorio"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  rules: z.array(RuleSchema).default([]),
  days: z.array(DayPlanSchema).min(1, "Il piano deve contenere almeno un giorno"),
});

export type ValidatedPlan = z.infer<typeof PlanImportSchema>;
