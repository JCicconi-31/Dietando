"use client";

import React, { useState } from "react";
import { Sparkles, ClipboardList, Trash2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Plan } from "@/types/diet";

interface DietBannerProps {
  plan: Plan;
  onOpenImport: () => void;
  onOpenRules: () => void;
  onRemovePlan: () => void;
}

export function DietBanner({
  plan,
  onOpenImport,
  onOpenRules,
  onRemovePlan,
}: DietBannerProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <>
      {/* 1. VERSIONE MOBILE (Ultra-compatta con espansione a fisarmonica su richiesta) */}
      <div className="sm:hidden rounded-2xl border border-orange-200/60 dark:border-orange-900/40 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-500/20 dark:via-amber-500/10 overflow-hidden transition-all shadow-xs">
        {/* Barra compatta sempre visibile (ridotta al minimo ingombro verticale) */}
        <div
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="px-3 py-2 flex items-center justify-between gap-2 cursor-pointer select-none active:bg-orange-500/10"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#ea580c]/15 text-[#ea580c] dark:text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles size={13} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#ea580c] dark:text-orange-400 uppercase tracking-wider">
                  Dieta Attiva
                </span>
                {plan.rules && plan.rules.length > 0 && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300">
                    {plan.rules.length} regole
                  </span>
                )}
              </div>
              <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate max-w-[210px]">
                {plan.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileExpanded(!isMobileExpanded);
              }}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white/80 dark:bg-[#202025]/80 text-[#ea580c] dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/40 flex items-center gap-1 cursor-pointer"
            >
              <span>{isMobileExpanded ? "Riduci" : "Dettagli"}</span>
              {isMobileExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Pannello espandibile su mobile con note e azioni */}
        {isMobileExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-orange-200/30 dark:border-orange-900/30 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {plan.notes ? (
              <div className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-[#1a1a1e]/70 p-2.5 rounded-xl border border-orange-100 dark:border-stone-800">
                <FileText size={14} className="text-[#ea580c] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{plan.notes}</p>
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">Nessuna nota aggiuntiva per questo piano.</p>
            )}

            <div className="flex items-center gap-1.5 justify-end pt-1">
              <button
                type="button"
                onClick={onOpenImport}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-[#F7931E] hover:bg-[#ea580c] text-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <Sparkles size={12} />
                <span>Importa JSON</span>
              </button>

              <button
                type="button"
                onClick={onOpenRules}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#202025] border border-orange-200 dark:border-orange-850 text-[#ea580c] dark:text-orange-400 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ClipboardList size={12} />
                <span>Regole ({plan.rules?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Vuoi rimuovere questo piano alimentare?")) {
                    onRemovePlan();
                  }
                }}
                title="Rimuovi questo piano"
                className="p-1.5 rounded-xl bg-white dark:bg-[#202025] border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer active:scale-95"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. VERSIONE DESKTOP / TABLET (Spaziosa ed elegante) */}
      <div className="hidden sm:flex bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-500/20 dark:via-amber-500/10 p-4 sm:p-5 rounded-3xl border border-orange-200/50 dark:border-orange-900/40 items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c] dark:text-orange-400 uppercase tracking-wider mb-0.5">
            <Sparkles size={13} /> Piano Nutrizionale
          </div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 truncate">
            {plan.title}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1">
            {plan.notes || "Nessuna nota aggiuntiva."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImport}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F7931E] hover:bg-[#ea580c] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles size={13} />
            <span>Importa JSON</span>
          </button>
          <button
            type="button"
            onClick={onOpenRules}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#202025] border border-orange-200 dark:border-orange-850 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList size={14} />
            <span>{plan.rules?.length || 0} Regole</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Vuoi rimuovere questo piano alimentare?")) {
                onRemovePlan();
              }
            }}
            title="Rimuovi questo piano"
            className="text-xs font-semibold p-2 rounded-xl bg-white dark:bg-[#202025] border border-stone-200 dark:border-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer active:scale-95"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
