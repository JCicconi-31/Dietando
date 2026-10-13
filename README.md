# 🥗 Organizzatore Dieta

> **Web App Installabile (PWA)** in italiano che trasforma il piano alimentare redatto dal tuo nutrizionista in uno strumento pratico d'uso quotidiano: scelta intuitiva dei pasti, calcolo automatico della lista della spesa per reparto e controllo in tempo reale delle regole del piano.

---

## ⚡ Dichiarazione di Sviluppo (Vibe Coding)

Questo progetto è stato concepito e sviluppato seguendo la metodologia del **Vibe Coding** (sviluppo software full-stack in pair programming assistito da intelligenza artificiale avanzata). 
Requisiti funzionali e scelte architetturali sono stati tradotti in un'architettura web moderna, mobile-first, rigorosamente type-safe (TypeScript strict, Zod runtime validation, Vitest test suite) e ad altissime prestazioni.

---

## ⚠️ Esclusione di Responsabilità (Medical & Health Disclaimer)

> **IMPORTANTE — LEGGERE CON ATTENZIONE PRIMA DELL'USO**
> 
> 1. **Nessun Consiglio Medico o Nutrizionale:** **Organizzatore Dieta** NON è un dispositivo medico e NON fornisce consulenze nutrizionali, diagnosi, prescrizioni o calcoli calorici/metabolici.
> 2. **Solo Supporto Organizzativo:** L'applicazione lavora **esclusivamente sui dati del piano alimentare caricato dall'utente** e precedentemente prescritto da un nutrizionista, dietista o medico abilitato. Non inventa alimenti né modifica le indicazioni prescritte.
> 3. **Responsabilità:** L'utente è l'unico responsabile delle proprie scelte alimentari e dell'accuratezza dei dati importati. Per qualsiasi dubbio relativo alla salute o al proprio fabbisogno nutrizionale, consultare sempre un professionista sanitario abilitato.

---

## ✨ Funzionalità Principali

- 📱 **Mobile-First & PWA Installabile:** Progettata per l'uso immediato da smartphone e installabile come app nativa (iOS/Android) con funzionamento al 100% offline.
- 🎯 **Priorità UX "Oggi":** All'apertura dell'app visualizzi subito i pasti del giorno corrente e puoi cambiare al volo l'opzione che desideri mangiare.
- 🔄 **Alternative dei Pasti ("Oppure"):** Gestione delle scelte alternative previste dal nutrizionista (es. pasta al tonno *oppure* riso col pollo) con aggiornamento immediato di ingredienti e grammature.
- 🎉 **Pasto Libero:** Con un tap puoi contrassegnare qualsiasi pasto come "Pasto Libero" (es. pizza con amici): il pasto viene escluso automaticamente dal calcolo della spesa.
- 🛒 **Lista della Spesa Intelligente:**
  - **Moltiplicatore $N$ settimane:** Calcola la spesa per 1, 2, 3 o 4 settimane consecutive.
  - **Conversione automatica unità:** Converte automaticamente quantità $\ge 1000\text{g} \to \text{kg}$ e $\ge 1000\text{ml} \to \text{l}$.
  - **Raggruppamento per reparto:** Ortofrutta, Banco Frigo, Macelleria, Pescheria, Dispensa e Cereali, Condimenti, Surgelati.
  - **Aggiunta verdure fisse:** Opzione per aggiungere automaticamente una porzione fissa di verdure di stagione (+200g) a pranzo e cena.
  - **Caselle "Comprato":** Spunta gli ingredienti acquistati al supermercato (stato salvato anche offline!).
  - **Copia Lista:** Copia la spesa formattata e ordinata per reparto negli appunti con un solo click.
- ⚖️ **Validatore di Regole del Piano:** Controlla le frequenze settimanali (es. affettati max 3 volte, pesce almeno 3 volte, pasti liberi max 2) e mostra avvisi discreti senza mai bloccare l'utente.
- 📄 **Importazione Piano tramite JSON & AI Prompt:** Nessuna spesa di crediti API! Carica il tuo piano nutrizionale tramite file `.json` generato gratuitamente tramite Claude o Gemini con il nostro prompt guidato e revisione obbligatoria prima del salvataggio.
- 🔒 **Privacy Rigorosa:** Zero analytics o tracker di terze parti, isolamento completo per utente e pulsante per cancellare tutti i dati personali.

---

## 🛠️ Stack Tecnologico

- **Frontend & Backend:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Linguaggio:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Tema personalizzato `#F7931E`, Dark/Light Mode)
- **Database & ORM:** [Prisma](https://www.prisma.io/) + PostgreSQL Serverless ([Neon](https://neon.tech/))
- **Validazione Dati:** [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/)
- **PWA:** Web App Manifest + Service Worker nativo per cache offline

---

## 🚀 Come Estrarre il JSON dal PDF con Gemini o Claude

Non servono chiavi API a pagamento nel codice dell'app. Puoi convertire il PDF della tua dieta in 4 semplici passaggi:

1. Apri **[Google AI Studio](https://aistudio.google.com/)**, **[Gemini](https://gemini.google.com/)** o **[Claude](https://claude.ai/)**.
2. Allega il file **PDF** della tua dieta rilasciato dal nutrizionista.
3. Copia e incolla il prompt riportato di seguito:

```text
Sei un assistente esperto in estrazione di dati clinici e nutrizionali.
In allegato trovi il documento PDF del piano alimentare rilasciato da un nutrizionista.

Il tuo compito è convertire fedelmente e integralmente l'intero piano alimentare nel formato JSON rigoroso descritto di seguito, compatibile con l'applicazione "Organizzatore Dieta".

### ISTRUZIONI CRITICHE:
1. NON inventare alimenti o grammature. Estrai solo ciò che è esplicitamente scritto nel PDF.
2. Se un pasto offre scelte alternative (es. "oppure", "in alternativa", o più righe/colonne di scelta), crea elementi distinti nell'array "options".
3. Mappa correttamente ogni ingrediente a una categoria ("category") e a un reparto del supermercato ("department") scegliendo tra quelli consentiti.
4. Estrai tutte le note e le regole generali (es. "affettati max 3 volte a settimana", "pesce almeno 3 volte a settimana", pasti liberi) nell'array "rules".
5. Rispondi ESCLUSIVAMENTE con il codice JSON valido racchiuso tra tripli backtick (```json ... ```), senza saluti, introduzioni o commenti aggiuntivi.

### ENUM E VALORI AMMESSI:
- dayOfWeek: "LUNEDI", "MARTEDI", "MERCOLEDI", "GIOVEDI", "VENERDI", "SABATO", "DOMENICA"
- mealType: "COLAZIONE", "SPUNTINO_MATTINA", "PRANZO", "SPUNTINO_POMERIGGIO", "CENA", "ALTRO"
- category: "VERDURA", "FRUTTA", "CARNE", "PESCE", "AFFETTATI", "LATTICINI_UOVA", "CEREALI_PASTA_PANE", "LEGUMI", "CONDIMENTI_OLIO", "BEVANDE_SNACK", "SURGELATI", "ALTRO"
- department: "Ortofrutta", "Banco Frigo", "Macelleria", "Pescheria", "Dispensa e Cereali", "Condimenti e Spezie", "Surgelati", "Altro"
- unit: usa "g" per i grammi, "ml" per i liquidi, "pezzi" per frutti/uova/panini, "fette" per fette biscottate/pane/affettati, "cucchiai" per l'olio.
```

4. Salva la risposta come file `dieta.json` (oppure copiala) e caricala nell'app cliccando su **"Importa Piano (JSON)"**.

---

## 💻 Configurazione Database (Neon) & Setup Locale

### 1. Variabili d'ambiente (`.env`)
Su **Neon**, Prisma necessita di due stringhe di connessione:
- `DATABASE_URL`: Connessione tramite connection pooler (contiene `-pooler` nell'host).
- `DIRECT_URL`: Connessione diretta senza connection pooler (identica, ma **senza `-pooler`** nell'host).

Esempio:
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-tiny-mouse-b5l0ipc1-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:PASSWORD@ep-tiny-mouse-b5l0ipc1.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="la-tua-chiave-segreta"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Comandi Principali
```bash
# Sincronizzare lo schema con il database Neon
npx prisma db push

# Eseguire tutti i test automatici
npm test

# Avviare l'app in locale
npm run dev

# Compilare per la produzione
npm run build
```

---

## 🧪 Guida ai Test per Verificare che Funzioni

Ecco la checklist passo-passo per verificare l'app:

### Test 1: Test Automatici (Terminale)
Esegui:
```bash
npm test
```
Verifica che tutti i **16 test** per l'aggregatore della spesa e il validatore di regole passino con esito verde (✓).

### Test 2: Avvio e Navigazione ("Oggi" e "Settimana")
1. Avvia l'app con:
   ```bash
   npm run dev
   ```
2. Apri [http://localhost:3000](http://localhost:3000).
3. Noterai che l'app si apre subito sulla tab **Oggi** mostrando i pasti del giorno.
4. Clicca su **"Opzione 2"** in un pasto: gli ingredienti e le grammature si aggiornano istantaneamente.
5. Clicca sul pulsante **"Libero"**: il pasto viene evidenziato come pasto libero.

### Test 3: Lista della Spesa
1. Passa alla tab **"Lista Spesa"**.
2. Seleziona il moltiplicatore **"2 sett"**: vedrai le quantità raddoppiare e quelle oltre 1000g convertirsi in **kg** (es. `1.66 kg`).
3. Attiva il toggle **"Aggiungi verdure fisse a pranzo e cena (+200g)"**: compare la riga delle verdure nel reparto Ortofrutta.
4. Clicca su una casella di spunta: l'ingrediente viene barrato e la percentuale di avanzamento avanza.
5. Clicca su **"Copia lista"**: incolla gli appunti in un blocco note o su WhatsApp per verificare la formattazione pulita per reparto.

### Test 4: Regole del Piano
1. Passa alla tab **"Regole"**: vedrai lo stato in tempo reale di tutte le regole del nutrizionista (affettati, pesce, pasti liberi).
2. Se superi la soglia consentita (es. selezionando più pasti liberi), la regola mostrerà un badge arancione di avviso senza bloccare l'app.

### Test 5: Importazione File JSON
1. Clicca sul pulsante **"Importa Piano (JSON)"** in alto.
2. Prova a incollare un codice JSON o a caricare un file `.json`: l'app validerà la struttura e ti mostrerà la schermata di revisione prima di attivarlo.

### Test 6: Funzionamento Offline & PWA
1. Apri i DevTools del browser (`F12`), vai nella tab **Network** e imposta la velocità su **Offline**.
2. Ricarica la pagina: l'app continua a caricarsi e funzionare regolarmente grazie al Service Worker e alla persistenza locale.
