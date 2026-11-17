import { z } from "zod";
import { DayOfWeekSchema } from "@/lib/plan-schema";

export const PASSWORD_MIN_LENGTH = 8;

export const LoginSchema = z.object({
  emailOrName: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri.").max(60, "Nome troppo lungo."),
  email: z.string().trim().toLowerCase().pipe(z.email("Inserisci un indirizzo email valido.")),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La password deve contenere almeno ${PASSWORD_MIN_LENGTH} caratteri.`)
    .max(200, "Password troppo lunga."),
});

/** Dimensione massima del payload di sync (1 MB). */
export const MAX_DIET_PAYLOAD_BYTES = 1_000_000;

// Schema strutturale "largo": controlla la forma senza scartare campi extra del piano.
const PlanShapeSchema = z
  .looseObject({
    title: z.string().max(500),
    days: z.array(z.looseObject({ dayOfWeek: DayOfWeekSchema, meals: z.array(z.unknown()) })).max(7),
  })
  .nullable();

const SelectionsSchema = z.record(
  z.string().max(64),
  z.looseObject({
    selectedOptionId: z.string().nullable().optional(),
    isFreeMeal: z.boolean().optional(),
  })
);

const PurchasedSchema = z.record(z.string().max(300), z.boolean());

const SettingsSchema = z.object({
  weeksCount: z.number().int().min(1).max(8).optional(),
  addFixedVegetables: z.boolean().optional(),
  fixedVegetableGrams: z.number().min(0).max(5000).optional(),
  selectedShoppingDays: z.array(DayOfWeekSchema).max(7).optional(),
});

export const DietDataSchema = z.object({
  plan: PlanShapeSchema.optional(),
  selections: SelectionsSchema.nullable().optional(),
  purchased: PurchasedSchema.nullable().optional(),
  settings: SettingsSchema.nullable().optional(),
});

export type DietDataInput = z.infer<typeof DietDataSchema>;
