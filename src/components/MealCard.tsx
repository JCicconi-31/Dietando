"use client";

import React, { useState } from "react";
import {
  Coffee,
  Utensils,
  Apple,
  Moon,
  PartyPopper,
  Check,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Meal, MealSelection, MealType, CustomOptionInput } from "@/types/diet";
import { AddCustomOptionModal } from "@/components/AddCustomOptionModal";
import { formatQuantity } from "@/lib/shopping-list";

interface MealCardProps {
  meal: Meal;
  selection?: MealSelection;
  dayOfWeek: string;
  /** Nome leggibile del giorno (es. "Martedì"), usato nel modale di aggiunta. */
  dayLabel?: string;
  /** Evidenzia la card come prossimo pasto della giornata. */
  isNext?: boolean;
  addFixedVegetables: boolean;
  fixedVegetableGrams: number;
  onSelectOption: (optionId: string) => void;
  onToggleFreeMeal: () => void;
  onAddCustomOption?: (customData: CustomOptionInput) => void;
  onRemoveCustomOption?: (optionId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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
  dayLabel,
  isNext = false,
  addFixedVegetables,
  fixedVegetableGrams,
  onSelectOption,
  onToggleFreeMeal,
  onAddCustomOption,
  onRemoveCustomOption,
  isExpanded: isExpandedProp,
  onToggleExpand,
}: MealCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isCardExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const toggleCard = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const isFreeMeal = selection?.isFreeMeal || false;
  const isMainMeal = meal.mealType === "PRANZO" || meal.mealType === "CENA";

  // Determina quale opzione è attiva (selezionata o la prima per default)
  const activeOptionId = selection?.selectedOptionId || meal.options[0]?.id;
  const activeOption = meal.options.find((opt) => opt.id === activeOptionId) || meal.options[0];
  const customCount = meal.options.filter((opt) => opt.isCustom).length;

  const subtitle =
    meal.options.length > 1
      ? `${meal.options.length} alternative${
          customCount > 0 ? ` · ${customCount} personalizzat${customCount > 1 ? "e" : "a"}` : ""
        }`
      : "Opzione singola";

  const bodyId = `meal-body-${dayOfWeek}-${meal.id}`;

  return (
    <>
      <div
        className={`rounded-2xl transition-all border ${
          isFreeMeal
            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
            : isNext
            ? "bg-white dark:bg-[#1a1a1e] border-[#F7931E]/70 dark:border-orange-700/70 ring-2 ring-[#F7931E]/15 shadow-sm"
            : "bg-white dark:bg-[#1a1a1e] border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md"
        } ${isCardExpanded ? "p-3.5 sm:p-5" : "p-3 sm:p-3.5"}`}
      >
        {/* Header del Pasto: tocca per espandere/ridurre */}
        <div className={`flex items-center justify-between gap-2 ${isCardExpanded ? "mb-3" : "mb-0"}`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isCardExpanded}
            aria-controls={bodyId}
            onClick={toggleCard}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCard();
              }
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931E]"
          >
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
              {getMealIcon(meal.mealType)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base truncate">
                {meal.name}
              </h3>

              {/* Da ridotta mostra cosa si mangia, da espansa quante alternative ci sono */}
              {isCardExpanded ? (
                <span className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  {isNext && !isFreeMeal && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-px rounded-full bg-orange-100 dark:bg-orange-950/70 text-[#ea580c] dark:text-orange-400 shrink-0">
                      <Clock size={10} /> Prossimo
                    </span>
                  )}
                  <span className="truncate">{subtitle}</span>
                </span>
              ) : isFreeMeal ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  <PartyPopper size={11} /> Pasto libero
                </span>
              ) : activeOption ? (
                <span className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 truncate">
                  {activeOption.name}
                </span>
              ) : null}
            </div>

            <ChevronDown
              size={17}
              className={`text-stone-400 shrink-0 transition-transform ${isCardExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </div>

          {/* Interruttore Pasto Libero */}
          <button
            type="button"
            onClick={onToggleFreeMeal}
            aria-pressed={isFreeMeal}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 select-none shrink-0 ${
              isFreeMeal
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 font-bold"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
            title={
              isFreeMeal
                ? "Pasto libero attivo: tocca per tornare al piano"
                : "Segna come pasto libero (escluso dalla spesa)"
            }
          >
            <PartyPopper size={13} />
            <span>{isFreeMeal ? "Libero ✓" : "Libero"}</span>
          </button>
        </div>

        {/* Corpo della Card */}
        {isCardExpanded && (
          <div id={bodyId} className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {isFreeMeal ? (
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 border border-amber-200/60 dark:border-amber-900/40">
                <PartyPopper size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Pasto libero.</span> Gli ingredienti sono esclusi dalla lista
                  della spesa.
                </div>
                <button
                  type="button"
                  onClick={onToggleFreeMeal}
                  className="text-[11px] font-bold underline underline-offset-2 shrink-0 cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <>
                {/* Scelta tra le alternative ("oppure"), con il nome reale di ciascuna */}
                {meal.options.length > 1 && (
                  <div
                    role="radiogroup"
                    aria-label={`Alternative per ${meal.name}`}
                    className="flex items-center gap-1.5 mb-2.5 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5"
                  >
                    {meal.options.map((opt, idx) => {
                      const isSelected = opt.id === activeOption?.id;
                      const isCustom = Boolean(opt.isCustom);
                      return (
                        <div key={opt.id} className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onSelectOption(opt.id)}
                            title={opt.name}
                            className={`max-w-[11rem] sm:max-w-[16rem] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                              isSelected
                                ? isCustom
                                  ? "bg-gradient-to-r from-amber-600 to-[#F7931E] text-white shadow-sm shadow-orange-500/30 font-bold"
                                  : "bg-[#F7931E] text-white shadow-sm shadow-orange-500/25 font-bold"
                                : isCustom
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/70 dark:border-amber-900/50"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                            }`}
                          >
                            {isSelected ? (
                              <Check size={13} strokeWidth={3} className="shrink-0" />
                            ) : isCustom ? (
                              <Sparkles size={12} className="shrink-0 text-amber-500" />
                            ) : (
                              <span className="text-[10px] font-black opacity-60 shrink-0">{idx + 1}</span>
                            )}
                            <span className="truncate">{opt.name}</span>
                          </button>

                          {/* Eliminazione opzione personalizzata */}
                          {isCustom && onRemoveCustomOption && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Vuoi rimuovere "${opt.name}" dalle tue alternative?`)) {
                                  onRemoveCustomOption(opt.id);
                                }
                              }}
                              title={`Elimina "${opt.name}"`}
                              aria-label={`Elimina alternativa ${opt.name}`}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Nome e ingredienti dell'opzione attiva */}
                {activeOption && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                        {activeOption.name}
                      </div>
                      {activeOption.isCustom && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1 shrink-0">
                          <Sparkles size={10} /> Tua alternativa
                        </span>
                      )}
                    </div>

                    {/* Ingredienti con grammature */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {activeOption.ingredients.map((optIng) => (
                        <li
                          key={optIng.id}
                          className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-[#232328] border border-stone-100 dark:border-stone-850"
                        >
                          <span className="text-stone-700 dark:text-stone-300 truncate mr-2 font-medium">
                            {optIng.ingredient.name}
                          </span>
                          <span className="font-bold text-[#ea580c] dark:text-orange-400 shrink-0">
                            {formatQuantity(optIng.amount, optIng.unit)}
                          </span>
                        </li>
                      ))}

                      {/* Extra verdure fisse a pranzo/cena */}
                      {isMainMeal && addFixedVegetables && (
                        <li className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-1 truncate mr-2 font-medium">
                            <Sparkles size={12} /> Verdure di stagione
                          </span>
                          <span className="font-bold shrink-0">+{fixedVegetableGrams} g</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Aggiunta alternativa personalizzata */}
                {onAddCustomOption && (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-2.5 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/30 border border-dashed border-stone-300 dark:border-stone-700 transition-colors cursor-pointer active:scale-[0.99]"
                    title="Aggiungi un'alternativa personalizzata (inclusa nella spesa)"
                  >
                    <Plus size={13} />
                    Aggiungi un&apos;alternativa
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modale per Aggiungere Opzione Personalizzata */}
      {onAddCustomOption && isAddModalOpen && (
        <AddCustomOptionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          mealName={meal.name}
          dayLabel={dayLabel ?? dayOfWeek}
          onAdd={onAddCustomOption}
        />
      )}
    </>
  );
}
