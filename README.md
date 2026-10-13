# 🥗 Organizzatore Dieta

> **Web App Installabile (PWA)** in italiano che trasforma il piano alimentare redatto dal tuo nutrizionista in uno strumento pratico d'uso quotidiano: scelta intuitiva dei pasti, calcolo automatico della lista della spesa per reparto e controllo in tempo reale delle regole del piano.

---

## ⚡ Dichiarazione di Sviluppo (Vibe Coding)

Questo progetto è stato concepito e sviluppato seguendo la metodologia del **Vibe Coding** (sviluppo software full-stack assistito da intelligenza artificiale avanzata in pair programming). 
Grazie a questo approccio, idee di prodotto e requisiti funzionali sono stati tradotti in un'architettura web moderna, mobile-first, type-safe (TypeScript rigoroso, Zod runtime validation, Vitest test suite) ed estremamente reattiva in tempi record.

---

## ⚠️ Esclusione di Responsabilità (Medical & Health Disclaimer)

> **IMPORTANTE — LEGGERE CON ATTENZIONE PRIMA DELL'USO**
> 
> 1. **Nessun Consiglio Medico o Nutrizionale:** **Organizzatore Dieta** NON è un dispositivo medico e NON fornisce consulenze nutrizionali, diagnosi, prescrizioni o calcoli calorici/metabolici.
> 2. **Solo Supporto Organizzativo:** L'applicazione lavora **esclusivamente sui dati del piano alimentare caricato dall'utente** e prescritto da un nutrizionista, dietista o medico abilitato. Non inventa alimenti né modifica le indicazioni prescritte.
> 3. **Responsabilità:** L'utente è l'unico responsabile delle scelte alimentari e dell'accuratezza dei dati importati. Per qualsiasi dubbio relativo alla salute o al proprio fabbisogno nutrizionale, consultare sempre un professionista sanitario abilitato.

---

## ✨ Funzionalità Principali

- 📱 **Mobile-First & PWA Installabile:** Progettata per essere usata a una mano dallo smartphone e installabile come app nativa (iOS/Android) con funzionamento offline.
- 🎯 **Priorità UX "Oggi":** All'apertura dell'app visualizzi subito i pasti del giorno corrente e puoi cambiare al volo l'opzione che desideri mangiare.
- 🔄 **Alternative dei Pasti ("Oppure"):** Gestione chiara delle scelte alternative previste dal nutrizionista (es. pasta al tonno *oppure* riso col pollo) con aggiornamento immediato degli ingredienti e grammature.
- 🎉 **Pasto Libero:** Con un tap puoi contrassegnare qualsiasi pasto come "Pasto Libero" (es. pizza con amici): il pasto viene escluso automaticamente dalla lista della spesa.
- 🛒 **Lista della Spesa Intelligente:**
  - **Moltiplicatore $N$ settimane:** Calcola la spesa per 1, 2, 3 o 4 settimane consecutive.
  - **Conversione automatica unità:** Converte automaticamente quantità $\ge 1000\text{g} \to \text{kg}$ e $\ge 1000\text{ml} \to \text{l}$.
  - **Raggruppamento per reparto:** Ortofrutta, Banco Frigo, Macelleria, Pescheria, Dispensa e Cereali, Condimenti, Surgelati.
  - **Aggiunta verdure fisse:** Opzione per aggiungere automaticamente una porzione fissa di verdure di stagione (+200g) a pranzo e cena.
  - **Caselle "Comprato":** Spunta gli ingredienti mentre sei tra le corsie del supermercato (stato salvato anche offline!).
  - **Copia Lista:** Copia la spesa ordinata per reparto negli appunti con un solo click.
- ⚖️ **Validatore di Regole del Piano (Fase 2):** Controlla le frequenze settimanali (es. affettati max 3 volte, pesce almeno 3 volte, pasti liberi max 2) e mostra avvisi discreti senza bloccare l'utente.
- 📄 **Importazione Piano tramite JSON & AI Prompt:** Nessuna spesa di crediti API! Carica il tuo piano nutrizionale tramite file `.json` generato gratuitamente tramite Claude o Gemini con il nostro prompt guidato e revisione obbligatoria prima del salvataggio.
- 🔒 **Privacy Rigorosa:** Zero analytics o tracker di terze parti, isolamento completo per utente e pulsante per cancellare tutti i dati personali.

---

## 🛠️ Stack Tecnologico

- **Frontend & Backend:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Linguaggio:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Tema personalizzato `#F7931E`, Dark/Light Mode)
- **Database & ORM:** [Prisma](https://www.prisma.io/) + PostgreSQL ([Neon](https://neon.tech/) o [Supabase](https://supabase.com/))
- **Validazione Dati:** [Zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/)
- **PWA:** Web App Manifest + Service Worker nativo per cache offline

---

## 🚀 Come Estrarre il JSON dal PDF con Gemini o Claude

Non servono chiavi API a pagamento nel codice dell'app. Puoi generare il file JSON del tuo piano alimentare in 4 semplici passaggi:

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

4. Salva la risposta come file `mio_piano.json` (oppure copiala) e caricala nell'app cliccando su **"Importa Piano (JSON)"**.

---

## 💻 Installazione e Setup Locale

### Requisiti
- Node.js versione 18.18+ o 20+
- npm o pnpm

### Passaggi
```bash
# 1. Clona il repository
git clone https://github.com/TUO_USER/organizzatore-dieta.git
cd organizzatore-dieta

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env

# 4. Genera il client Prisma
npx prisma generate

# 5. Esegui i test automatici
npm test

# 6. Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser per utilizzare l'applicazione.

---

## 🧪 Esecuzione dei Test Automatici

L'applicazione include test automatici approfonditi per le logiche critiche di calcolo e validazione:

```bash
# Esegue tutti i test una volta (CI mode)
npm test

# Esegue i test in modalità watch per sviluppo
npm run test:watch
```

---

## 🚢 Deploy su Vercel

1. Crea un database PostgreSQL gratuito su **[Neon.tech](https://neon.tech)** o **[Supabase](https://supabase.com)**.
2. Collega il tuo repository GitHub a **[Vercel](https://vercel.com)**.
3. Nelle impostazioni di Vercel (*Environment Variables*), imposta:
   - `DATABASE_URL`: La stringa di connessione PostgreSQL con pooling.
   - `DIRECT_URL`: La stringa di connessione PostgreSQL diretta.
   - `AUTH_SECRET`: Una chiave casuale a 32 caratteri generata con `openssl rand -base64 32`.
4. Clicca su **Deploy**. La tua PWA sarà immediatamente attiva e installabile su qualsiasi smartphone.
