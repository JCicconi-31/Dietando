"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Layers,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { Plan, MealSelection, DayOfWeek, ALL_DAYS } from "@/types/diet";
import {
  aggregateShoppingList,
  formatShoppingListAsText,
  getNextNDays,
} from "@/lib/shopping-list";
import { DAYS_INFO } from "@/components/DaySelector";

interface ShoppingListViewProps {
  plan: Plan;
  selections: Record<string, MealSelection>;
  purchasedItems: Record<string, boolean>;
  weeksCount: number;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  selectedDays?: DayOfWeek[];
  currentDay?: DayOfWeek;
  onTogglePurchased: (itemKey: string) => void;
  onResetPurchased: () => void;
  onSetWeeksCount: (weeks: number) => void;
  onToggleFixedVegetables: (enabled: boolean) => void;
  onToggleDay?: (day: DayOfWeek) => void;
  onSetSelectedDays?: (days: DayOfWeek[]) => void;
}

function getDepartmentIcon(dept: string) {
  switch (dept) {
    case "Ortofrutta":
      return "🥬";
    case "Banco Frigo":
      return "🧀";
    case "Macelleria":
      return "🥩";
    case "Pescheria":
      return "🐟";
    case "Dispensa e Cereali":
      return "🌾";
    case "Condimenti e Spezie":
      return "🫒";
    case "Surgelati":
      return "❄️";
    default:
      return "📦";
  }
}

export function ShoppingListView({
  plan,
  selections,
  purchasedItems,
  weeksCount,
  addFixedVegetables,
  fixedVegetableGrams,
  selectedDays,
  currentDay = "LUNEDI",
  onTogglePurchased,
  onResetPurchased,
  onSetWeeksCount,
  onToggleFixedVegetables,
  onToggleDay,
  onSetSelectedDays,
}: ShoppingListViewProps) {
  const [copied, setCopied] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});

  const activeDays = selectedDays ?? ALL_DAYS;

  // Calcola la lista aggregata per reparto
  const groups = useMemo(() => {
    return aggregateShoppingList(plan, selections, {
      weeksCount,
      addFixedVegetables,
      fixedVegetableGrams,
      purchasedItems,
      selectedDays: activeDays,
    });
  }, [plan, selections, weeksCount, addFixedVegetables, fixedVegetableGrams, purchasedItems, activeDays]);

  // Conteggio totale e comprati
  const { totalItems, purchasedCount } = useMemo(() => {
    let total = 0;
    let purchased = 0;
    for (const group of groups) {
      for (const item of group.items) {
        total++;
        if (item.isPurchased) purchased++;
      }
    }
    return { totalItems: total, purchasedCount: purchased };
  }, [groups]);

  const progressPercent = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;

  const handleCopyList = async () => {
    const text = formatShoppingListAsText(groups, weeksCount, activeDays);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback per ambienti limitati
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Impossibile copiare la lista negli appunti:", err);
    }
  };

  const toggleDept = (dept: string) => {
    setCollapsedDepts((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Barra di Controllo: Giorni, Moltiplicatore Settimane & Azioni */}
      <div className="bg-white dark:bg-[#1a1a1e] rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5">
        
        {/* SEZIONE 1: Selezione Giorni per la Spesa con Scorciatoie */}
        <div className="space-y-2.5 pb-3 border-b border-stone-100 dark:border-stone-850">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#F7931E]" />
                Giorni per la spesa:
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30">
                {activeDays.length === 7
                  ? "Tutta la settimana (7)"
                  : activeDays.length === 0
                  ? "0 selezionati"
                  : `${activeDays.length} di 7 giorni`}
              </span>
            </div>

            {/* Pulsanti Rapidi (Presets: 2gg, 3gg, 4gg, tutti, ecc.) */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(ALL_DAYS)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDays.length === 7
                    ? "bg-[#F7931E] text-white shadow-sm"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Includi tutti i 7 giorni della settimana"
              >
                Tutti (7)
              </button>
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(getNextNDays(currentDay, 2))}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                title={`Spesa per i prossimi 2 giorni partendo da oggi`}
              >
                2 giorni
              </button>
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(getNextNDays(currentDay, 3))}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                title={`Spesa per i prossimi 3 giorni partendo da oggi`}
              >
                3 giorni
              </button>
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(getNextNDays(currentDay, 4))}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                title={`Spesa per i prossimi 4 giorni partendo da oggi`}
              >
                4 giorni
              </button>
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(["LUNEDI", "MARTEDI", "MERCOLEDI", "GIOVEDI", "VENERDI"])}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
              >
                Lun-Ven
              </button>
              <button
                type="button"
                onClick={() => onSetSelectedDays?.(["SABATO", "DOMENICA"])}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors cursor-pointer"
              >
                Weekend
              </button>
            </div>
          </div>

          {/* Selettore Singoli Giorni (Toggle individuale) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAYS_INFO.map((d) => {
              const isSelected = activeDays.includes(d.key);
              const isToday = currentDay === d.key;

              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => onToggleDay?.(d.key)}
                  className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F7931E] text-white shadow-sm shadow-orange-500/25 scale-[1.01]"
                      : "bg-stone-100 dark:bg-stone-800/80 text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-750 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                  title={`${d.label}: ${isSelected ? "Incluso nella spesa (clicca per rimuovere)" : "Escluso dalla spesa (clicca per aggiungere)"}`}
                >
                  <span className="truncate">{d.short}</span>
                  {isToday ? (
                    <span
                      className={`text-[8.5px] px-1 rounded uppercase tracking-wider font-extrabold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      Oggi
                    </span>
                  ) : (
                    <span className="text-[10px] leading-tight font-black opacity-80">
                      {isSelected ? "✓" : "+"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEZIONE 2: Moltiplicatore Settimane & Azioni */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Selettore N Settimane */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Layers size={14} className="text-[#F7931E]" /> Moltiplica per:
            </span>
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => onSetWeeksCount(n)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    weeksCount === n
                      ? "bg-[#F7931E] text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                  }`}
                >
                  {n} {n === 1 ? "sett" : "sett"}
                </button>
              ))}
            </div>
          </div>

          {/* Pulsanti Copia e Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyList}
              disabled={activeDays.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                activeDays.length === 0
                  ? "bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
                  : copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#F7931E] hover:bg-[#ea580c] text-white shadow-orange-500/25"
              }`}
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
              <span>{copied ? "Copiata!" : "Copia lista"}</span>
            </button>

            {purchasedCount > 0 && (
              <button
                onClick={onResetPurchased}
                title="Azzera tutte le caselle comprato"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 transition-colors"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Aggiungi Verdure Fisse ai pasti principali */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={addFixedVegetables}
              onChange={(e) => onToggleFixedVegetables(e.target.checked)}
              className="w-4 h-4 rounded text-[#F7931E] accent-[#F7931E] cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F7931E]" />
              Aggiungi verdure fisse a pranzo e cena (+{fixedVegetableGrams}g)
            </span>
          </label>
        </div>

        {/* Progress bar avanzamento spesa */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
            <span>Avanzamento acquisti</span>
            <span>
              {purchasedCount} su {totalItems} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F7931E] to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Raggruppamento per Reparto del Supermercato o Stato Vuoto */}
      {activeDays.length === 0 ? (
        <div className="p-8 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-[#1a1a1e] rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
          <Calendar size={36} className="mx-auto opacity-40 text-[#F7931E]" />
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Nessun giorno selezionato
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Seleziona almeno un giorno della settimana o usa le scorciatoie in alto per calcolare la lista della spesa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSetSelectedDays?.(ALL_DAYS)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F7931E] hover:bg-[#ea580c] text-white transition-colors cursor-pointer shadow-sm"
          >
            Seleziona tutta la settimana
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-8 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-[#1a1a1e] rounded-2xl border border-stone-200 dark:border-stone-800">
          <ShoppingBag size={32} className="mx-auto mb-2 opacity-40 text-[#F7931E]" />
          Nessun ingrediente nella lista per le impostazioni selezionate.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isCollapsed = collapsedDepts[group.department] || false;
            const groupPurchased = group.items.filter((i) => i.isPurchased).length;

            return (
              <div
                key={group.department}
                className="bg-white dark:bg-[#1a1a1e] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Header del Reparto */}
                <button
                  onClick={() => toggleDept(group.department)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-stone-50/60 dark:bg-[#202025]/60 hover:bg-stone-100/60 dark:hover:bg-[#25252b]/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{getDepartmentIcon(group.department)}</span>
                    <span className="font-bold text-sm text-stone-800 dark:text-stone-200">
                      {group.department}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                      ({groupPurchased}/{group.items.length})
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown size={16} className="text-stone-400" />
                  ) : (
                    <ChevronUp size={16} className="text-stone-400" />
                  )}
                </button>

                {/* Elenco Articoli del Reparto */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-100 dark:divide-stone-850 px-2 sm:px-3">
                    {group.items.map((item) => (
                      <label
                        key={item.itemKey}
                        className={`flex items-center justify-between py-3 px-2.5 sm:px-3 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850 active:bg-orange-500/5 transition-all select-none ${
                          item.isPurchased ? "opacity-50 bg-stone-50/40 dark:bg-stone-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 mr-3">
                          <input
                            type="checkbox"
                            checked={Boolean(item.isPurchased)}
                            onChange={() => onTogglePurchased(item.itemKey)}
                            className="w-5 h-5 rounded text-[#F7931E] accent-[#F7931E] cursor-pointer shrink-0"
                          />
                          <span
                            className={`text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 truncate ${
                              item.isPurchased ? "line-through text-stone-400 dark:text-stone-500" : ""
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {/* Quantità calcolata e convertita (es. 1.2 kg, 450 g) */}
                        <span
                          className={`text-xs font-bold shrink-0 px-2.5 py-1 rounded-lg ${
                            item.isPurchased
                              ? "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
                              : "bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 border border-orange-100 dark:border-orange-900/40"
                          }`}
                        >
                          {item.displayAmount}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
