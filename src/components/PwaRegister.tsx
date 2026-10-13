"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    // 1. Se l'utente visita con ?reset=1, esegui un reset totale di cache e service worker
    if (typeof window !== "undefined" && window.location.search.includes("reset=1")) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
      // Rimuovi il parametro e ricarica pulito
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 300);
      return;
    }

    // 2. Registrazione standard Service Worker con auto-update
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.update();
        })
        .catch((error) => {
          console.error("Registrazione Service Worker non riuscita:", error);
        });
    }
  }, []);

  return null;
}
