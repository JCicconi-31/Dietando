"use client";

import React from "react";
import { X, LogOut, Trash2, User, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";
import { AuthUser } from "@/lib/client-auth";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onResetPlan?: () => void;
  hasActivePlan?: boolean;
  onOpenInstall?: () => void;
}

export function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onDeleteAccount,
  onResetPlan,
  hasActivePlan,
  onOpenInstall,
}: AccountModalProps) {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5">
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
            <ShieldCheck size={20} className="text-[#F7931E]" />
            Account Personale
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Utente */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#222228] border border-stone-200/70 dark:border-stone-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#ea580c] dark:text-orange-400 flex items-center justify-center font-bold text-lg shrink-0">
            <User size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
              {currentUser.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {currentUser.email}
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Autenticato &bull; Spazio Dati Riservato
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          I tuoi piani alimentari, le opzioni selezionate e la lista della spesa sono rigorosamente
          associati al tuo account personale e inaccessibili ad altri utenti.
        </p>

        {/* Azioni Account */}
        <div className="space-y-2 pt-1">
          {/* Installa su Android / Mobile */}
          {onOpenInstall && (
            <button
              onClick={() => {
                onOpenInstall();
                onClose();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-[#ea580c] dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone size={15} />
                <span>Scarica / Installa app su Android</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-200/60 dark:bg-orange-900/80 px-2 py-0.5 rounded-full">
                PWA
              </span>
            </button>
          )}

          {/* Rimuovi / Cambia Piano se presente */}
          {hasActivePlan && onResetPlan && (
            <button
              onClick={() => {
                if (window.confirm("Vuoi rimuovere il piano attivo corrente per inserirne uno nuovo?")) {
                  onResetPlan();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-stone-100 dark:bg-[#25252b] hover:bg-stone-200 dark:hover:bg-[#2d2d34] text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-stone-500" />
                <span>Rimuovi piano alimentare attivo</span>
              </div>
            </button>
          )}

          {/* Disconnetti */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-[#F7931E] hover:bg-[#ea580c] text-white shadow-sm transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Disconnetti (Logout)</span>
          </button>

          {/* Elimina Account */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Sei sicuro di voler eliminare definitivamente il tuo account e tutti i dati salvati (piano, pasti, spesa)?"
                )
              ) {
                onDeleteAccount();
                onClose();
              }
            }}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Elimina account e cancella tutti i miei dati</span>
          </button>
        </div>
      </div>
    </div>
  );
}
