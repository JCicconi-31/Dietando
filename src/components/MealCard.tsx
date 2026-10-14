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
  ChevronUp,
} from "lucide-react";
import { Meal, MealSelection, MealType, CustomOptionInput } from "@/types/diet";
import { AddCustomOptionModal } from "@/components/AddCustomOptionModal";

interface MealCardProps {
  meal: Meal;
  selection?: MealSelection;
  dayOfWeek: string;
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
  const hasCustomOption = meal.options.some((opt) => opt.isCustom);

  return (
    <>
      <div
        className={`rounded-2xl transition-all border ${
          isFreeMeal
            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
            : "bg-white dark:bg-[#1a1a1e] border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md"
        } ${isCardExpanded ? "p-3.5 sm:p-5" : "p-3 sm:p-3.5"}`}
      >
        {/* Header del Pasto: Cliccabile per espandere/collassare */}
        <div
          onClick={toggleCard}
          className={`flex items-center justify-between gap-2.5 cursor-pointer select-none ${
            isCardExpanded ? "mb-3" : "mb-0"
          }`}
        >
          {/* Info Principali Pasto */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
              {getMealIcon(meal.mealType)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base truncate">
                  {meal.name}
                </h3>

                {/* Badge opzione selezionata quando la card è ridotta */}
                {!isCardExpanded && (
                  <div className="min-w-0 flex-1">
                    {isFreeMeal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        <PartyPopper size={11} /> Libero
                      </span>
                    ) : activeOption ? (
                      <span className="inline-block text-[11px] font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-lg truncate max-w-[170px] sm:max-w-xs">
                        {activeOption.name}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Sottotitolo visibile solo quando espanso */}
              {isCardExpanded && (
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  {meal.options.length > 1
                    ? `${meal.options.length} alternative ${hasCustomOption ? "(include custom)" : "disponibili"}`
                    : "Opzione singola"}
                </span>
              )}
            </div>
          </div>

          {/* Azioni Header: Aggiungi Alternativa + Pasto Libero + Toggle Chevron */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isCardExpanded ? (
              <>
                {/* FR-1 Trigger Aggiunta Alternativa Personalizzata */}
                {onAddCustomOption && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddModalOpen(true);
                    }}
                    className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/60 dark:border-orange-850 transition-all cursor-pointer active:scale-95 select-none"
                    title="Aggiungi alternativa o ingrediente personalizzato (incluso nella spesa)"
                  >
                    <Plus size={13} />
                    <span className="hidden sm:inline">Alternativa</span>
                    <span className="sm:hidden text-[11px] font-bold">+ Alt</span>
                  </button>
                )}

                {/* Pulsante Pasto Libero */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFreeMeal();
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 select-none ${
                    isFreeMeal
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 font-bold"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                  title="Segna come pasto libero (escluso dalla spesa)"
                >
                  <PartyPopper size={13} />
                  <span className="hidden sm:inline">{isFreeMeal ? "Pasto Libero" : "Libero"}</span>
                  <span className="sm:hidden text-[11px] font-bold">{isFreeMeal ? "Libero" : "Libero"}</span>
                </button>

                {/* Pulsante Riduci Card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard();
                  }}
                  title="Riduci scheda pasto"
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1">
                <ChevronDown size={17} />
              </div>
            )}
          </div>
        </div>

        {/* Corpo della Card: Visibile solo quando espanso */}
        {isCardExpanded && (
          <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {isFreeMeal ? (
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 border border-amber-200/60 dark:border-amber-900/40">
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
                  <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto no-scrollbar pb-1">
                    {meal.options.map((opt, idx) => {
                      const isSelected = opt.id === activeOption?.id;
                      const isCustom = Boolean(opt.isCustom);
                      return (
                        <div key={opt.id} className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSelectOption(opt.id)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none ${
                              isSelected
                                ? isCustom
                                  ? "bg-gradient-to-r from-amber-600 to-[#F7931E] text-white shadow-sm shadow-orange-500/30 font-bold"
                                  : "bg-[#F7931E] text-white shadow-sm shadow-orange-500/25 font-bold"
                                : isCustom
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/70 dark:border-amber-900/50"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={3} />}
                            {isCustom && <Sparkles size={12} className="shrink-0 text-amber-300" />}
                            <span>{isCustom ? opt.name : `Opzione ${idx + 1}`}</span>
                          </button>

                          {/* Pulsante Eliminazione Opzione Custom */}
                          {isCustom && onRemoveCustomOption && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Vuoi rimuovere "${opt.name}" dalle opzioni personalizzate?`
                                  )
                                ) {
                                  onRemoveCustomOption(opt.id);
                                }
                              }}
                              title={`Elimina opzione custom "${opt.name}"`}
                              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Pulsante inline per aggiungere un'altra opzione */}
                    {onAddCustomOption && (
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/30 border border-dashed border-stone-300 dark:border-stone-700 cursor-pointer active:scale-95"
                        title="Aggiungi un'altra alternativa"
                      >
                        <Plus size={12} />
                        <span>Aggiungi</span>
                      </button>
                    )}
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
                          <Sparkles size={10} /> Alternativa Personalizzata
                        </span>
                      )}
                    </div>

                    {/* Elenco Ingredienti con grammature */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {activeOption.ingredients.map((optIng) => (
                        <div
                          key={optIng.id}
                          className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-[#232328] border border-stone-100 dark:border-stone-850"
                        >
                          <span className="text-stone-700 dark:text-stone-300 truncate mr-2 font-medium">
                            {optIng.ingredient.name}
                          </span>
                          <span className="font-bold text-[#ea580c] dark:text-orange-400 shrink-0">
                            {optIng.amount} {optIng.unit}
                          </span>
                        </div>
                      ))}

                      {/* Extra verdure fisse a pranzo/cena */}
                      {isMainMeal && addFixedVegetables && (
                        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
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
        )}
      </div>

      {/* Modale per Aggiungere Opzione Personalizzata */}
      {onAddCustomOption && isAddModalOpen && (
        <AddCustomOptionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          mealName={meal.name}
          dayLabel={dayOfWeek}
          onAdd={onAddCustomOption}
        />
      )}
    </>
  );
}
