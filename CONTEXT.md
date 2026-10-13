# CONTEXT.md: Decisioni Architetturali e di Design

Questo documento riassume le decisioni architetturali, i vincoli e le motivazioni tecniche adottate nello sviluppo di **Organizzatore Dieta**.

---

## 1. Decisione su Importer PDF vs File JSON Guidato

### Contesto Iniziale
Il piano iniziale prevedeva un endpoint server-side con chiamate a modelli multimodali (es. Gemini Vision o GPT-4o) per analizzare il file PDF direttamente sul server.

### Decisione Adottata
È stato scelto di supportare l'importazione **esclusivamente tramite file JSON strutturato**, fornendo all'utente un prompt ottimizzato e collaudato da incollare assieme al proprio PDF su Gemini o Claude.

### Vantaggi:
1. **Costi Zero & No Lock-in:** Nessun costo di fatturazione API cloud per l'utente o lo sviluppatore.
2. **Privacy Superiore:** Nessun file PDF sanitario transita o risiede temporaneamente sui server dell'applicazione. L'utente elabora il documento direttamente nel suo account AI di fiducia.
3. **Controllo & Revisione Totale:** Il JSON generato viene validato con uno schema **Zod** rigoroso e sottoposto a una schermata di revisione prima dell'applicazione al piano attivo.
4. **Resilienza e Manutenibilità:** I modelli di visione e le API cambiano rapidamente parametri e formati; il parsing di un file JSON standardizzato rende l'app immune a breaking changes di terze parti.

---

## 2. Architettura Offline-First e PWA

### Motivazione
Uno dei principali casi d'uso dell'applicazione è la consultazione della lista della spesa all'interno dei supermercati, dove la connessione di rete cellulare è spesso debole o assente.

### Implementazione:
- **Service Worker (`public/sw.js`):** Cache delle risorse statiche dell'app shell per consentire il caricamento istantaneo anche senza rete.
- **Client Storage Sync (`src/lib/client-store.ts`):** Tutte le preferenze (scelta delle opzioni, pasti liberi, spunte dei prodotti acquistati, moltiplicatore settimane) vengono salvate in `localStorage` e conservate nel tempo.
- **Rilevamento Network:** Un indicatore visivo nell'header segnala quando l'app opera in modalità offline, garantendo all'utente trasparenza sull'affidabilità dei dati locali.

---

## 3. Disaccoppiamento della Logica di Business

Per garantire affidabilità e manutenibilità a lungo termine, le due logiche critiche del dominio sono state implementate come **funzioni pure TypeScript**, completamente separate da componenti React e database:

1. **Aggregatore Lista della Spesa (`src/lib/shopping-list.ts`):**
   - Riceve in input il piano, le selezioni dei pasti e le opzioni.
   - Restituisce la lista aggregata, suddivisa per reparto e con le unità convertite.
   - Coperto da test unitari automatici su scalabilità, conversioni e casi limite.

2. **Validatore delle Regole (`src/lib/rules-validator.ts`):**
   - Le regole del nutrizionista sono modellate come **dati** (`type`, `targetCategory`, `max`, `min`, `exceptions`), non come codice hardcoded.
   - Calcola le frequenze settimanali effettive e genera avvisi chiari senza mai bloccare le scelte dell'utente.

---

## 4. Isolamento Dati e Rispetto della Privacy

- **Dati Sanitari:** Non vengono raccolti né inviati dati a server di terze parti (no Google Analytics, no SDK pubblicitari).
- **Multi-Utenza:** Ciascuna tabella nel database Prisma possiede una colonna `userId`. Nessuna query espone record appartenenti ad altri utenti.
- **Diritto all'Oblio (GDPR):** È presente un pulsante esplicito *"Elimina il mio account e tutti i miei dati"* che resetta in modo definitivo tutti i dati memorizzati.
