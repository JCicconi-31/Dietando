"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAllData: () => void;
}

export function PrivacyModal({ isOpen, onClose, onDeleteAllData }: PrivacyModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedDone, setDeletedDone] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    onDeleteAllData();
    setDeletedDone(true);
    setTimeout(() => {
      setDeletedDone(false);
      setConfirmDelete(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl max-w-lg w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
            <ShieldAlert size={20} className="text-[#F7931E]" />
            Privacy e Trattamento Dati
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Testo Informativa */}
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          <p>
            <strong>Organizzatore Dieta</strong> è progettato nel pieno rispetto della tua privacy e
            della riservatezza dei tuoi dati alimentari e sanitari:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-500 dark:text-stone-400 text-xs">
            <li>
              <strong>Zero Analytics:</strong> Nessun cookie di profilazione, nessun tracker di terze
              parti (no Google Analytics, no Facebook Pixel).
            </li>
            <li>
              <strong>Dati Isolati:</strong> Ogni utente ha un profilo separato con dati completamente
              inaccessibili agli altri utenti.
            </li>
            <li>
              <strong>Nessuna conservazione PDF:</strong> I file caricati per l&apos;estrazione non vengono
              conservati sui server una volta elaborati.
            </li>
            <li>
              <strong>Offline first:</strong> Le tue preferenze e liste della spesa sono memorizzate
              sul tuo dispositivo.
            </li>
          </ul>
        </div>

        {/* Zona Eliminazione Account e Dati */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-850 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Diritto all&apos;oblio (Elimina dati)
          </h4>

          {deletedDone ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={16} /> Tutti i dati locali e la sessione sono stati eliminati.
            </div>
          ) : !confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={15} />
              Elimina il mio account e tutti i miei dati
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2.5">
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Sei sicuro? Questa azione eliminerà permanentemente tutte le tue selezioni, preferenze
                e spunte.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  Conferma eliminazione
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
