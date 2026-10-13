import { IngredientCategory } from "@/types/diet";

export interface ParsedFoodItem {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  department: string;
}

// Reparti supermercato disponibili
export const SUPERMARKET_DEPARTMENTS = [
  "Banco Frigo",
  "Ortofrutta",
  "Macelleria",
  "Pescheria",
  "Dispensa e Cereali",
  "Condimenti e Spezie",
  "Surgelati",
  "Altro",
] as const;

export type SupermarketDepartment = (typeof SUPERMARKET_DEPARTMENTS)[number];

// Unità di misura comuni
export const COMMON_UNITS = [
  { value: "g", label: "Grammi (g)" },
  { value: "ml", label: "Millilitri (ml)" },
  { value: "pezzi", label: "Pezzi (pz)" },
  { value: "fette", label: "Fette" },
  { value: "porzione", label: "Porzione" },
  { value: "cucchiai", label: "Cucchiai" },
] as const;

// Tabella delle parole chiave per inferire Categoria nutrizionale e Reparto supermercato
interface FoodPattern {
  keywords: string[];
  category: IngredientCategory;
  department: SupermarketDepartment;
  defaultUnit?: string;
  defaultAmount?: number;
}

const FOOD_PATTERNS: FoodPattern[] = [
  // LATTICINI E UOVA (Banco Frigo)
  {
    keywords: [
      "primo sale",
      "primosale",
      "mozzarella",
      "ricotta",
      "stracchino",
      "feta",
      "parmigiano",
      "grana",
      "pecorino",
      "caciotta",
      "scamorza",
      "formaggio",
      "formaggi",
      "yogurt",
      "fiocchi di latte",
      "kefir",
      "latte",
      "burro",
      "quark",
      "mascarpone",
      "gorgonzola",
      "uova",
      "uovo",
      "albume",
    ],
    category: "LATTICINI_UOVA",
    department: "Banco Frigo",
    defaultUnit: "g",
    defaultAmount: 100,
  },
  // AFFETTATI E SALUMI (Banco Frigo)
  {
    keywords: [
      "bresaola",
      "fesa",
      "fesa di tacchino",
      "prosciutto",
      "crudo",
      "cotto",
      "speck",
      "salame",
      "mortadella",
      "arista",
      "carpaccio",
    ],
    category: "AFFETTATI",
    department: "Banco Frigo",
    defaultUnit: "g",
    defaultAmount: 80,
  },
  // CARNE (Macelleria)
  {
    keywords: [
      "pollo",
      "tacchino",
      "manzo",
      "vitello",
      "vitellone",
      "maiale",
      "macinato",
      "trita",
      "hamburger",
      "lonza",
      "coniglio",
      "bistecca",
      "fettina",
      "fuso",
      "coscia",
      "arista",
      "straccetti",
    ],
    category: "CARNE",
    department: "Macelleria",
    defaultUnit: "g",
    defaultAmount: 150,
  },
  // PESCE (Pescheria)
  {
    keywords: [
      "salmone",
      "tonno",
      "merluzzo",
      "orata",
      "spigola",
      "nasello",
      "platessa",
      "branzino",
      "pesce spada",
      "pesce",
      "gamberi",
      "gamberetti",
      "polpo",
      "calamari",
      "seppie",
      "cozze",
      "vongole",
      "sgombro",
      "trota",
      "baccalà",
      "alice",
      "alici",
      "acciughe",
      "sarde",
    ],
    category: "PESCE",
    department: "Pescheria",
    defaultUnit: "g",
    defaultAmount: 150,
  },
  // VERDURA (Ortofrutta)
  {
    keywords: [
      "insalata",
      "lattuga",
      "pomodoro",
      "pomodori",
      "pomodorini",
      "zucchine",
      "zucchina",
      "melanzane",
      "melanzana",
      "spinaci",
      "bietole",
      "broccoli",
      "broccolo",
      "cavolo",
      "cavolfiore",
      "finocchi",
      "finocchio",
      "carote",
      "carota",
      "cetrioli",
      "cetriolo",
      "peperoni",
      "peperone",
      "fagiolini",
      "asparagi",
      "funghi",
      "radicchio",
      "rucola",
      "carciofi",
      "zucca",
      "cipolla",
      "cipolle",
      "porri",
      "verdura",
      "verdure",
    ],
    category: "VERDURA",
    department: "Ortofrutta",
    defaultUnit: "g",
    defaultAmount: 200,
  },
  // FRUTTA (Ortofrutta)
  {
    keywords: [
      "mela",
      "mele",
      "pera",
      "pere",
      "banana",
      "banane",
      "arancia",
      "arance",
      "mandarino",
      "mandarini",
      "clementina",
      "pesca",
      "pesche",
      "albicocca",
      "albicocche",
      "kiwi",
      "fragola",
      "fragole",
      "frutti di bosco",
      "mirtilli",
      "lamponi",
      "prugna",
      "prugne",
      "uva",
      "anguria",
      "melone",
      "ananas",
      "frutta",
    ],
    category: "FRUTTA",
    department: "Ortofrutta",
    defaultUnit: "g",
    defaultAmount: 150,
  },
  // CEREALI, PASTA, PANE (Dispensa e Cereali)
  {
    keywords: [
      "pasta",
      "riso",
      "pane",
      "basmati",
      "farro",
      "orzo",
      "avena",
      "fiocchi d'avena",
      "couscous",
      "quinoa",
      "mais",
      "gallette",
      "cracker",
      "fette biscottate",
      "piadina",
      "cereali",
      "muesli",
      "granola",
      "grano saraceno",
      "gnocchi",
      "farina",
    ],
    category: "CEREALI_PASTA_PANE",
    department: "Dispensa e Cereali",
    defaultUnit: "g",
    defaultAmount: 80,
  },
  // LEGUMI (Dispensa e Cereali)
  {
    keywords: [
      "ceci",
      "lenticchie",
      "fagioli",
      "piselli",
      "soia",
      "edamame",
      "lupini",
      "cicerchie",
      "legumi",
    ],
    category: "LEGUMI",
    department: "Dispensa e Cereali",
    defaultUnit: "g",
    defaultAmount: 100,
  },
  // CONDIMENTI E OLIO (Condimenti e Spezie)
  {
    keywords: [
      "olio",
      "olio evo",
      "olio extravergine",
      "aceto",
      "sale",
      "pepe",
      "origano",
      "rosmarino",
      "spezie",
      "cannella",
      "curcuma",
    ],
    category: "CONDIMENTI_OLIO",
    department: "Condimenti e Spezie",
    defaultUnit: "g",
    defaultAmount: 10,
  },
  // SURGELATI (Surgelati)
  {
    keywords: ["surgelato", "surgelati", "surgelata", "minestrone surgelato"],
    category: "SURGELATI",
    department: "Surgelati",
    defaultUnit: "g",
    defaultAmount: 200,
  },
];

/**
 * Inferisce categoria nutrizionale e reparto supermercato in base al nome dell'alimento
 */
export function inferCategoryAndDepartment(name: string): {
  category: IngredientCategory;
  department: string;
  defaultUnit: string;
  defaultAmount: number;
} {
  const norm = name.trim().toLowerCase();

  for (const pattern of FOOD_PATTERNS) {
    for (const kw of pattern.keywords) {
      // Verifica corrispondenza come parola o sottostringa
      const regex = new RegExp(`(^|\\b|\\s)${kw}(\\b|\\s|$)`, "i");
      if (regex.test(norm) || norm.includes(kw)) {
        return {
          category: pattern.category,
          department: pattern.department,
          defaultUnit: pattern.defaultUnit || "g",
          defaultAmount: pattern.defaultAmount || 100,
        };
      }
    }
  }

  // Fallback: Default a "Banco Frigo" / "Altro" come da specifica FR-2
  return {
    category: "ALTRO",
    department: "Banco Frigo",
    defaultUnit: "g",
    defaultAmount: 100,
  };
}

/**
 * Pulisce e capitalizza il nome di un alimento
 */
function cleanName(raw: string): string {
  const trimmed = raw.trim().replace(/^[-–—:,.\s]+|[-–—:,.\s]+$/g, "");
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Parser per estrarre nome, quantità e unità di misura da un input testuale
 * Esempi supportati:
 * - "Primo Sale 100g" -> name: "Primo Sale", amount: 100, unit: "g"
 * - "Formaggio Primo Sale 150 g" -> name: "Formaggio Primo Sale", amount: 150, unit: "g"
 * - "Petto di pollo 200 gr" -> name: "Petto di pollo", amount: 200, unit: "g"
 * - "Latte parzialmente scremato 200ml" -> name: "Latte parzialmente scremato", amount: 200, unit: "ml"
 * - "2 uova" -> name: "Uova", amount: 2, unit: "pezzi"
 * - "3 fette di pane" -> name: "Pane", amount: 3, unit: "fette"
 * - "Mela 1 pz" -> name: "Mela", amount: 1, unit: "pezzi"
 * - "Primo Sale" -> name: "Primo Sale", amount: 100, unit: "g" (default inferito)
 */
export function parseCustomFoodInput(input: string): ParsedFoodItem {
  const raw = input.trim();
  if (!raw) {
    return {
      name: "",
      amount: 100,
      unit: "g",
      category: "ALTRO",
      department: "Banco Frigo",
    };
  }

  // 1. Pattern suffisso quantità: es. "Primo Sale 100g", "Ricotta 150 g", "Pollo 200gr", "Latte 250ml", "Pane 2 fette"
  const suffixRegex =
    /^(.*?)[,\s]+(\d+(?:[.,]\d+)?)\s*(g|gr|grammi|ml|millilitri|kg|l|litri|pz|pezzi|fette|cucchiai|porzioni|porzione)?$/i;
  const suffixMatch = raw.match(suffixRegex);

  if (suffixMatch) {
    const rawName = suffixMatch[1];
    const rawQty = parseFloat(suffixMatch[2].replace(",", "."));
    const rawUnit = suffixMatch[3] ? suffixMatch[3].toLowerCase() : "";

    let normalizedUnit = "g";
    if (rawUnit === "g" || rawUnit === "gr" || rawUnit === "grammi") normalizedUnit = "g";
    else if (rawUnit === "ml" || rawUnit === "millilitri") normalizedUnit = "ml";
    else if (rawUnit === "kg") normalizedUnit = "kg";
    else if (rawUnit === "l" || rawUnit === "litri") normalizedUnit = "l";
    else if (rawUnit === "pz" || rawUnit === "pezzi") normalizedUnit = "pezzi";
    else if (rawUnit === "fette") normalizedUnit = "fette";
    else if (rawUnit === "cucchiai") normalizedUnit = "cucchiai";
    else if (rawUnit === "porzioni" || rawUnit === "porzione") normalizedUnit = "porzione";
    else {
      // Se l'unità non è esplicitata nel suffisso, inferiscila
      const inferred = inferCategoryAndDepartment(rawName);
      normalizedUnit = inferred.defaultUnit;
    }

    const cleaned = cleanName(rawName);
    const inferred = inferCategoryAndDepartment(cleaned);

    return {
      name: cleaned,
      amount: isNaN(rawQty) || rawQty <= 0 ? inferred.defaultAmount : rawQty,
      unit: normalizedUnit,
      category: inferred.category,
      department: inferred.department,
    };
  }

  // 2. Pattern prefisso quantità: es. "2 uova", "3 fette di pane", "1 mela"
  const prefixRegex =
    /^(\d+(?:[.,]\d+)?)\s*(g|gr|grammi|ml|pz|pezzi|fette|cucchiai|porzioni)?\s+(?:di\s+)?(.*)$/i;
  const prefixMatch = raw.match(prefixRegex);

  if (prefixMatch) {
    const rawQty = parseFloat(prefixMatch[1].replace(",", "."));
    const rawUnit = prefixMatch[2] ? prefixMatch[2].toLowerCase() : "";
    const rawName = prefixMatch[3];

    let normalizedUnit = "pezzi";
    if (rawUnit === "g" || rawUnit === "gr" || rawUnit === "grammi") normalizedUnit = "g";
    else if (rawUnit === "ml") normalizedUnit = "ml";
    else if (rawUnit === "fette") normalizedUnit = "fette";
    else if (rawUnit === "cucchiai") normalizedUnit = "cucchiai";
    else if (rawUnit === "porzioni") normalizedUnit = "porzione";
    else if (rawUnit === "pz" || rawUnit === "pezzi") normalizedUnit = "pezzi";
    else {
      // Senza unità specifica all'inizio (es. "2 uova"), default a pezzi o unit dell'ingrediente
      normalizedUnit = "pezzi";
    }

    const cleaned = cleanName(rawName);
    const inferred = inferCategoryAndDepartment(cleaned);

    return {
      name: cleaned,
      amount: isNaN(rawQty) || rawQty <= 0 ? 1 : rawQty,
      unit: normalizedUnit,
      category: inferred.category,
      department: inferred.department,
    };
  }

  // 3. Solo nome senza quantità numerica: es. "Primo Sale", "Formaggio Primo Sale"
  const cleaned = cleanName(raw);
  const inferred = inferCategoryAndDepartment(cleaned);

  return {
    name: cleaned,
    amount: inferred.defaultAmount,
    unit: inferred.defaultUnit,
    category: inferred.category,
    department: inferred.department,
  };
}
