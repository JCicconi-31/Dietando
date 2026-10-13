"use client";

import React, { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page Error:", error);
  }, [error]);

  const handleHardReset = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn("Reset fallito:", e);
    }
    window.location.href = window.location.origin + "?t=" + Date.now();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-[#121215] text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a20] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center mx-auto mb-4 text-white font-black text-xl shadow-md shadow-orange-500/25">
          OD
        </div>
        <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-2">
          Si è verificato un errore
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-6">
          La pagina non è riuscita a caricarsi correttamente a causa di dati in memoria non sincronizzati.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={handleHardReset}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ea580c] to-[#F7931E] text-white shadow-md shadow-orange-500/25 cursor-pointer active:scale-95 transition-transform"
          >
            Ripristina e Riapri App
          </button>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer transition-colors"
          >
            Riprova Ricarica
          </button>
        </div>

        {error?.message && (
          <details className="mt-4 text-left text-[11px] text-stone-400">
            <summary className="cursor-pointer">Dettagli tecnici</summary>
            <pre className="mt-2 p-2 bg-stone-100 dark:bg-stone-900 rounded-lg overflow-x-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
