"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ShoppingBag,
  Plus,
  Tag,
  Check,
  Scale,
} from "lucide-react";
import { CustomOptionInput, IngredientCategory } from "@/types/diet";
import {
  parseCustomFoodInput,
  SUPERMARKET_DEPARTMENTS,
  COMMON_UNITS,
  SupermarketDepartment,
} from "@/lib/custom-food";

interface AddCustomOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealName: string;
  dayLabel: string;
  onAdd: (data: CustomOptionInput) => void;
}

const PRESET_SUGGESTIONS = [
  "Primo Sale 100g",
  "Ricotta 150g",
  "Mozzarella 125g",
  "Petto di pollo 150g",
  "Salmone 150g",
  "2 uova",
  "Yogurt greco 150g",
];

export function AddCustomOptionModal({
  isOpen,
  onClose,
  mealName,
  dayLabel,
  onAdd,
}: AddCustomOptionModalProps) {
  const [quickInput, setQuickInput] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(100);
  const [unit, setUnit] = useState<string>("g");
  const [department, setDepartment] = useState<string>("Banco Frigo");
  const [category, setCategory] = useState<IngredientCategory>("ALTRO");
  const [hasAutoParsed, setHasAutoParsed] = useState(false);

  if (!isOpen) return null;

  const handleQuickInputChange = (text: string) => {
    setQuickInput(text);
    if (!text.trim()) {
      setName("");
      setHasAutoParsed(false);
      return;
    }

    const parsed = parseCustomFoodInput(text);
    setName(parsed.name);
    setAmount(parsed.amount);
    setUnit(parsed.unit);
    setDepartment(parsed.department);
    setCategory(parsed.category);
    setHasAutoParsed(true);
  };

  const handleApplyPreset = (suggestion: string) => {
    setQuickInput(suggestion);
    const parsed = parseCustomFoodInput(suggestion);
    setName(parsed.name);
    setAmount(parsed.amount);
    setUnit(parsed.unit);
    setDepartment(parsed.department);
    setCategory(parsed.category);
    setHasAutoParsed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || quickInput.trim();
    if (!finalName) return;

    // Se l'utente ha solo scritto nel quickInput senza ritoccare
    const parsed = parseCustomFoodInput(finalName);
    const resolvedName = name.trim() || parsed.name || finalName;
    const resolvedAmount = amount > 0 ? amount : parsed.amount || 100;
    const resolvedUnit = unit.trim() || parsed.unit || "g";
    const resolvedDept = department || parsed.department || "Banco Frigo";
    const resolvedCat = category || parsed.category || "ALTRO";

    onAdd({
      name: resolvedName,
      amount: resolvedAmount,
      unit: resolvedUnit,
      department: resolvedDept,
      category: resolvedCat,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-400 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                Nuova Alternativa Pasto
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {mealName} • {dayLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avviso Regole & Spesa */}
        <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-xs text-orange-950 dark:text-orange-300 flex items-start gap-2.5">
          <ShoppingBag size={16} className="text-[#ea580c] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Flessibilità Controllata:</span>
            <p className="text-[11px] leading-relaxed opacity-90">
              Questa opzione <strong>non è uno sgarro</strong> e non consumerà i tuoi pasti liberi
              settimanali. Verrà automaticamente sincronizzata nella lista della spesa.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Rapido Intelligente */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#F7931E]" />
              <span>Inserimento Rapido (testo libero)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => handleQuickInputChange(e.target.value)}
                placeholder='Es. "Primo Sale 100g", "Petto di pollo 150g", "2 uova"'
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#232328] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/40 focus:border-[#F7931E]"
              />
            </div>
          </div>

          {/* Suggerimenti rapidi in pillole */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Esempi Frequenti:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => handleApplyPreset(sugg)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/60 hover:text-[#ea580c] transition-colors cursor-pointer"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Dettagli analitici / Modificabili */}
          <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-[#222228]/80 border border-stone-200/70 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <Tag size={13} />
                Dettagli Alimento
              </span>
              {hasAutoParsed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={11} strokeWidth={3} /> Riconosciuto
                </span>
              )}
            </div>

            {/* Nome Alimento */}
            <div>
              <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                Nome Opzione / Ingrediente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Primo Sale"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/40"
              />
            </div>

            {/* Quantità e Unità di misura */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1 flex items-center gap-1">
                  <Scale size={11} /> Quantità
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                  Unità di Misura
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/40"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reparto Supermercato */}
            <div>
              <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1 flex items-center gap-1">
                <ShoppingBag size={11} /> Reparto Supermercato (per la spesa)
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as SupermarketDepartment)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/40"
              >
                {SUPERMARKET_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pulsanti Azione */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim() && !quickInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ea580c] to-[#F7931E] hover:opacity-95 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Aggiungi al Pasto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
