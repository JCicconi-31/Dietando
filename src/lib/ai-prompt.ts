/**
 * Prompt ottimizzato da fornire a Gemini (Google AI Studio o Gemini Advanced) o Claude (Anthropic)
 * insieme al file PDF del piano alimentare per ottenere il JSON strutturato e validabile.
 */
export const EXTRACTOR_AI_PROMPT = `Sei un assistente esperto in estrazione di dati clinici e nutrizionali.
In allegato trovi il documento PDF del piano alimentare rilasciato da un nutrizionista.

Il tuo compito è convertire fedelmente e integralmente l'intero piano alimentare nel formato JSON rigoroso descritto di seguito, compatibile con l'applicazione "Organizzatore Dieta".

### ISTRUZIONI CRITICHE:
1. NON inventare alimenti o grammature. Estrai solo ciò che è esplicitamente scritto nel PDF.
2. Se un pasto offre scelte alternative (es. "oppure", "in alternativa", o più righe/colonne di scelta), crea elementi distinti nell'array "options".
3. Mappa correttamente ogni ingrediente a una categoria ("category") e a un reparto del supermercato ("department") scegliendo tra quelli consentiti.
4. Estrai tutte le note e le regole generali (es. "affettati max 3 volte a settimana", "pesce almeno 3 volte a settimana", pasti liberi) nell'array "rules".
5. Rispondi ESCLUSIVAMENTE con il codice JSON valido racchiuso tra tripli backtick (\`\`\`json ... \`\`\`), senza saluti, introduzioni o commenti aggiuntivi.

---

### ENUM E VALORI AMMESSI:
- dayOfWeek: "LUNEDI", "MARTEDI", "MERCOLEDI", "GIOVEDI", "VENERDI", "SABATO", "DOMENICA"
- mealType: "COLAZIONE", "SPUNTINO_MATTINA", "PRANZO", "SPUNTINO_POMERIGGIO", "CENA", "ALTRO"
- category: "VERDURA", "FRUTTA", "CARNE", "PESCE", "AFFETTATI", "LATTICINI_UOVA", "CEREALI_PASTA_PANE", "LEGUMI", "CONDIMENTI_OLIO", "BEVANDE_SNACK", "SURGELATI", "ALTRO"
- department: "Ortofrutta", "Banco Frigo", "Macelleria", "Pescheria", "Dispensa e Cereali", "Condimenti e Spezie", "Surgelati", "Altro"
- unit: usa "g" per i grammi, "ml" per i liquidi, "pezzi" per frutti/uova/panini, "fette" per fette biscottate/pane/affettati, "cucchiai" per l'olio.

---

### STRUTTURA DEL JSON DA RESTITUIRE:
{
  "title": "Piano Alimentare Personalizzato",
  "notes": "Eventuali raccomandazioni generali del nutrizionista (es. bere 2 litri d'acqua, olio a crudo)",
  "rules": [
    {
      "type": "max_per_week",
      "targetCategory": "AFFETTATI",
      "max": 3,
      "description": "Affettati massimo 3 volte a settimana, crudo escluso",
      "exceptions": ["prosciutto crudo"]
    },
    {
      "type": "min_per_week",
      "targetCategory": "PESCE",
      "min": 3,
      "description": "Pesce almeno 3 volte a settimana"
    },
    {
      "type": "free_meals_limit",
      "max": 2,
      "description": "1–2 pasti liberi a settimana"
    }
  ],
  "days": [
    {
      "dayOfWeek": "LUNEDI",
      "orderIndex": 0,
      "meals": [
        {
          "mealType": "COLAZIONE",
          "name": "Colazione",
          "orderIndex": 0,
          "options": [
            {
              "name": "Yogurt greco con fiocchi d'avena e mirtilli",
              "orderIndex": 0,
              "ingredients": [
                {
                  "ingredient": {
                    "name": "Yogurt greco 0%",
                    "category": "LATTICINI_UOVA",
                    "department": "Banco Frigo"
                  },
                  "amount": 170,
                  "unit": "g"
                },
                {
                  "ingredient": {
                    "name": "Fiocchi d'avena integrali",
                    "category": "CEREALI_PASTA_PANE",
                    "department": "Dispensa e Cereali"
                  },
                  "amount": 40,
                  "unit": "g"
                }
              ]
            }
          ]
        },
        {
          "mealType": "PRANZO",
          "name": "Pranzo",
          "orderIndex": 2,
          "options": [
            {
              "name": "Pasta integrale con tonno e zucchine",
              "orderIndex": 0,
              "ingredients": [
                {
                  "ingredient": {
                    "name": "Pasta integrale",
                    "category": "CEREALI_PASTA_PANE",
                    "department": "Dispensa e Cereali"
                  },
                  "amount": 80,
                  "unit": "g"
                },
                {
                  "ingredient": {
                    "name": "Tonno al naturale",
                    "category": "PESCE",
                    "department": "Dispensa e Cereali"
                  },
                  "amount": 112,
                  "unit": "g"
                }
              ]
            },
            {
              "name": "Riso basmati con petto di pollo e verdure",
              "orderIndex": 1,
              "ingredients": [
                {
                  "ingredient": {
                    "name": "Riso basmati",
                    "category": "CEREALI_PASTA_PANE",
                    "department": "Dispensa e Cereali"
                  },
                  "amount": 80,
                  "unit": "g"
                },
                {
                  "ingredient": {
                    "name": "Petto di pollo a fette",
                    "category": "CARNE",
                    "department": "Macelleria"
                  },
                  "amount": 150,
                  "unit": "g"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Ora elabora il PDF allegato e restituisci il JSON completo per tutti i giorni della settimana presenti nel documento.`;
