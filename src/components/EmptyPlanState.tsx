"use client";

import React from "react";
import { Sparkles, FileText, ArrowRight, BookOpen, Utensils, CheckCircle } from "lucide-react";

interface EmptyPlanStateProps {
  onOpenImport: () => void;
  onLoadSample?: () => void;
  userName?: string;
}

export function EmptyPlanState({
  onOpenImport,
  onLoadSample,
  userName,
}: EmptyPlanStateProps) {
  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Hero Alert Box */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/40 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-[#1a1a20] rounded-3xl p-6 sm:p-8 border border-orange-200 dark:border-orange-900/50 shadow-sm space-y-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F7931E] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Utensils size={28} />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] dark:text-orange-400 uppercase tracking-wider">
              <Sparkles size={14} /> Benvenuto{userName ? `, ${userName}` : ""}!
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              Nessun piano alimentare presente
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
              Per iniziare a pianificare i pasti di oggi, visualizzare la settimana e generare la tua lista della spesa intelligente, devi prima inserire il tuo piano nutrizionale.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onOpenImport}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F7931E] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Inserisci / Importa Piano Alimentare</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white dark:bg-[#25252b] hover:bg-stone-100 dark:hover:bg-[#2d2d35] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen size={15} className="text-stone-400" />
              <span>Oppure carica piano di prova</span>
            </button>
          )}
        </div>
      </div>

      {/* Guida Passo-Passo all'Inserimento */}
      <div className="bg-white dark:bg-[#1a1a1f] rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <FileText size={16} className="text-[#F7931E]" />
          Come inserire la tua dieta in 3 semplici passi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#222228] border border-stone-200/70 dark:border-stone-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-400 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Copia il Prompt AI
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Clicca su &ldquo;Importa Piano&rdquo; e copia il nostro prompt pre-configurato pronto per l&apos;analisi medica.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#222228] border border-stone-200/70 dark:border-stone-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-400 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Allega il tuo PDF
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Incolla il prompt su Google Gemini o Claude insieme al PDF fornito dal tuo nutrizionista.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#222228] border border-stone-200/70 dark:border-stone-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-400 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Incolla il JSON
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Incolla il testo JSON generato o carica il file. L&apos;app estrarrà automaticamente pasti, opzioni e pesi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={14} />
          <span>I tuoi dati rimangono isolati nel tuo account e non sono accessibili ad altri utenti.</span>
        </div>
      </div>
    </div>
  );
}
