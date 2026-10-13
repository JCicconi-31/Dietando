"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  MoreVertical,
  PlusSquare,
  WifiOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNativePrompt: boolean;
  isStandalone: boolean;
  onNativeInstall: () => Promise<boolean>;
}

export function InstallAppModal({
  isOpen,
  onClose,
  hasNativePrompt,
  isStandalone,
  onNativeInstall,
}: InstallAppModalProps) {
  const [installing, setInstalling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await onNativeInstall();
    } finally {
      setInstalling(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1a1e] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-500/5 dark:via-orange-500/5 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center shadow-lg shadow-orange-500/25 text-white">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Scarica su Android
                <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Web App PWA
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Installazione immediata senza passare dal Play Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 dark:text-stone-300">
          {/* Se già installata */}
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-stone-900 dark:text-stone-100">
                L'applicazione è già installata!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Stai già eseguendo Organizzatore Dieta in modalità autonoma a schermo intero. Puoi trovarla tra le tue applicazioni su Android.
              </p>
            </div>
          ) : (
            <>
              {/* Bottone 1-Click se prima interazione o browser compatibile */}
              {hasNativePrompt && (
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800 dark:text-orange-300">
                    <Sparkles size={16} className="text-[#F7931E]" />
                    <span>Installazione con 1 tocco disponibile</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Il tuo browser supporta l'installazione diretta. Tocca il pulsante qui sotto per aggiungere subito l'app alla schermata principale di Android.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ea580c] to-[#F7931E] hover:from-[#c2410c] hover:to-[#ea580c] text-white shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Download size={18} />
                    {installing ? "Installazione in corso..." : "Installa Ora su Android"}
                  </button>
                </div>
              )}

              {/* Guida Passo-Passo per Google Chrome su Android */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Come installare da Google Chrome (Android):
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#202025] border border-stone-200/80 dark:border-stone-800">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-[#ea580c] dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        Apri il menu di Chrome
                        <MoreVertical size={14} className="text-stone-500 inline" />
                      </p>
                      <p className="text-stone-500 dark:text-stone-400">
                        Tocca l'icona con i <strong>tre puntini verticali (⋮)</strong> nell'angolo in alto a destra del browser.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#202025] border border-stone-200/80 dark:border-stone-800">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-[#ea580c] dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        Tocca "Aggiungi a schermata Home" o "Installa app"
                        <PlusSquare size={14} className="text-stone-500 inline" />
                      </p>
                      <p className="text-stone-500 dark:text-stone-400">
                        Scorri l'elenco delle opzioni e seleziona <strong>"Installa app"</strong> oppure <strong>"Aggiungi a schermata Home"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#202025] border border-stone-200/80 dark:border-stone-800">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-[#ea580c] dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        Conferma l'installazione
                        <CheckCircle2 size={14} className="text-emerald-500 inline" />
                      </p>
                      <p className="text-stone-500 dark:text-stone-400">
                        Premi <strong>"Installa"</strong>. L'icona arancione dell'Organizzatore Dieta apparirà subito tra le applicazioni del tuo smartphone!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vantaggi dell'app */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#202025] border border-stone-200/70 dark:border-stone-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Perché installarla sul tuo telefono:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <Smartphone size={15} className="text-[#F7931E] shrink-0" />
                    <span>Schermo intero senza barra URL</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <WifiOff size={15} className="text-[#F7931E] shrink-0" />
                    <span>Funziona anche senza internet</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <ShieldCheck size={15} className="text-[#F7931E] shrink-0" />
                    <span>Nessun account Play Store richiesto</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <Sparkles size={15} className="text-[#F7931E] shrink-0" />
                    <span>Aggiornamenti automatici istantanei</span>
                  </div>
                </div>
              </div>

              {/* Se sei su PC: copia link per aprire su telefono */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Sei su computer? Apri il link dal browser del tuo smartphone:
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span>Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copia indirizzo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#151518] border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
