"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrato:", registration.scope);
        })
        .catch((error) => {
          console.error("Registrazione Service Worker fallita:", error);
        });
    }
  }, []);

  return null;
}
