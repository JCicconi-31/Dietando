"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Forza l'aggiornamento immediato del service worker
          registration.update();
        })
        .catch((error) => {
          console.error("Registrazione Service Worker non riuscita:", error);
        });
    }
  }, []);

  return null;
}
