export type DayOfWeek =
  | "LUNEDI"
  | "MARTEDI"
  | "MERCOLEDI"
  | "GIOVEDI"
  | "VENERDI"
  | "SABATO"
  | "DOMENICA";

export const ALL_DAYS: DayOfWeek[] = [
  "LUNEDI",
  "MARTEDI",
  "MERCOLEDI",
  "GIOVEDI",
  "VENERDI",
  "SABATO",
  "DOMENICA",
];

export type MealType =
  | "COLAZIONE"
  | "SPUNTINO_MATTINA"
  | "PRANZO"
  | "SPUNTINO_POMERIGGIO"
  | "CENA"
  | "ALTRO";

export type IngredientCategory =
  | "VERDURA"
  | "FRUTTA"
  | "CARNE"
  | "PESCE"
  | "AFFETTATI"
  | "LATTICINI_UOVA"
  | "CEREALI_PASTA_PANE"
  | "LEGUMI"
  | "CONDIMENTI_OLIO"
  | "BEVANDE_SNACK"
  | "SURGELATI"
  | "ALTRO";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  department: string; // Reparto supermercato (es. "Ortofrutta", "Banco Frigo", "Macelleria", etc.)
}

export interface OptionIngredient {
  id: string;
  ingredientId: string;
  ingredient: Ingredient;
  amount: number;
  unit: string; // 'g', 'ml', 'pezzi', 'fette', 'cucchiai', etc.
  notes?: string;
}

export interface Option {
  id: string;
  mealId: string;
  name: string; // es. "Pasta al pomodoro e ricotta"
  orderIndex: number;
  ingredients: OptionIngredient[];
}

export interface Meal {
  id: string;
  dayId: string;
  mealType: MealType;
  name: string; // es. "Pranzo", "Cena", "Spuntino Mattina"
  orderIndex: number;
  options: Option[];
}

export interface DayPlan {
  id: string;
  planId: string;
  dayOfWeek: DayOfWeek;
  orderIndex: number;
  meals: Meal[];
}

export interface Rule {
  id: string;
  planId: string;
  type: "max_per_week" | "min_per_week" | "max_per_day" | "free_meals_limit" | string;
  targetCategory?: string; // es. "AFFETTATI", "PESCE", "LEGUMI"
  max?: number;
  min?: number;
  description: string;
  exceptions?: string[]; // es. ["prosciutto crudo"]
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  days: DayPlan[];
  rules: Rule[];
}

export interface MealSelection {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  selectedOptionId?: string | null;
  isFreeMeal: boolean;
  extraVegGrams: number; // default 0 (o 200 se attivato per i pasti principali)
  notes?: string;
}

export interface WeekMenuState {
  weekStartDate: string; // ISO string (Lunedì)
  selections: Record<string, MealSelection>; // key: `${dayOfWeek}_${mealType}`
  purchasedItems: Record<string, boolean>; // key: itemKey
}

export interface AggregatedShoppingItem {
  itemKey: string;
  name: string;
  category: IngredientCategory;
  department: string;
  rawAmount: number;
  rawUnit: string;
  displayAmount: string; // es. "1.2 kg", "450 g", "3 fette"
  isPurchased?: boolean;
}

export interface DepartmentShoppingGroup {
  department: string;
  items: AggregatedShoppingItem[];
}
