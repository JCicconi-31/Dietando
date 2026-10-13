"use client";

import React from "react";
import { Coffee, Utensils, Apple, Moon, PartyPopper, Check, Sparkles } from "lucide-react";
import { Meal, MealSelection, MealType } from "@/types/diet";

interface MealCardProps {
  meal: Meal;
  selection?: MealSelection;
  dayOfWeek: string;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  onSelectOption: (optionId: string) => void;
  onToggleFreeMeal: () => void;
}

function getMealIcon(type: MealType) {
  switch (type) {
    case "COLAZIONE":
      return <Coffee size={18} className="text-[#F7931E]" />;
    case "SPUNTINO_MATTINA":
    case "SPUNTINO_POMERIGGIO":
      return <Apple size={18} className="text-amber-500" />;
    case "PRANZO":
      return <Utensils size={18} className="text-[#ea580c]" />;
    case "CENA":
      return <Moon size={18} className="text-indigo-400" />;
    default:
      return <Utensils size={18} className="text-stone-400" />;
  }
}

export function MealCard({
  meal,
  selection,
  dayOfWeek,
  addFixedVegetables,
  fixedVegetableGrams,
  onSelectOption,
  onToggleFreeMeal,
}: MealCardProps) {
  const isFreeMeal = selection?.isFreeMeal || false;
  const isMainMeal = meal.mealType === "PRANZO" || meal.mealType === "CENA";

  // Determina quale opzione è attiva (selezionata o la prima per default)
  const activeOptionId = selection?.selectedOptionId || meal.options[0]?.id;
  const activeOption = meal.options.find((opt) => opt.id === activeOptionId) || meal.options[0];

  return (
    <div
      className={`rounded-2xl transition-all border p-4 sm:p-5 ${
        isFreeMeal
          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
          : "bg-white dark:bg-[#1a1a1e] border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Header del Pasto */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            {getMealIcon(meal.mealType)}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
              {meal.name}
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              {meal.options.length > 1
                ? `${meal.options.length} alternative disponibili`
                : "Opzione singola"}
            </span>
          </div>
        </div>

        {/* Pulsante Pasto Libero */}
        <button
          onClick={onToggleFreeMeal}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none ${
            isFreeMeal
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 font-bold"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
          }`}
          title="Segna come pasto libero (escluso dalla spesa)"
        >
          <PartyPopper size={14} />
          <span>{isFreeMeal ? "Pasto Libero" : "Libero"}</span>
        </button>
      </div>

      {/* Se il pasto è segnato come pasto libero */}
      {isFreeMeal ? (
        <div className="p-3.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 border border-amber-200/60 dark:border-amber-900/40">
          <PartyPopper size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Pasto libero selezionato.</span> Goditi il pasto fuori o la
            pizza! Gli ingredienti sono esclusi dalla lista della spesa.
          </div>
        </div>
      ) : (
        <>
          {/* Switcher Opzioni Alternative ("oppure") */}
          {meal.options.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
              {meal.options.map((opt, idx) => {
                const isSelected = opt.id === activeOption?.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectOption(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                      isSelected
                        ? "bg-[#F7931E] text-white shadow-sm shadow-orange-500/25 font-bold"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                    <span>{`Opzione ${idx + 1}`}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Nome e ingredienti dell'opzione attiva */}
          {activeOption && (
            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                {activeOption.name}
              </div>

              {/* Elenco Ingredienti con grammature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activeOption.ingredients.map((optIng) => (
                  <div
                    key={optIng.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-[#232328] border border-stone-100 dark:border-stone-850"
                  >
                    <span className="text-stone-700 dark:text-stone-300 truncate mr-2">
                      {optIng.ingredient.name}
                    </span>
                    <span className="font-bold text-[#ea580c] dark:text-orange-400 shrink-0">
                      {optIng.amount} {optIng.unit}
                    </span>
                  </div>
                ))}

                {/* Extra verdure fisse a pranzo/cena */}
                {isMainMeal && addFixedVegetables && (
                  <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1 truncate mr-2 font-medium">
                      <Sparkles size={12} /> Verdure di stagione
                    </span>
                    <span className="font-bold shrink-0">+{fixedVegetableGrams} g</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
