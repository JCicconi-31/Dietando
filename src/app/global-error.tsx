"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
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
      console.warn("Reset cache fallito:", e);
    }
    // Ricarica forzata da rete
    window.location.href = window.location.origin + "?t=" + Date.now();
  };

  return (
    <html lang="it">
      <head>
        <title>Organizzatore Dieta - Ripristino</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, background: "#121215", color: "#f5f5f4", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: "420px", width: "100%", background: "#1a1a20", borderRadius: "24px", padding: "32px 24px", border: "1px solid #2a2a35", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #ea580c, #F7931E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#fff", fontWeight: "900", fontSize: "22px" }}>
              OD
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "800", margin: "0 0 10px 0", color: "#fff" }}>
              Si è verificato un problema di caricamento
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#a8a29e", lineHeight: "1.5", margin: "0 0 24px 0" }}>
              La memoria del browser sul tuo dispositivo ha riscontrato un conflitto con una versione precedente. Tocca il pulsante qui sotto per ripristinare e caricare l'app aggiornata.
            </p>

            <button
              onClick={handleHardReset}
              style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg, #ea580c, #F7931E)", color: "#fff", border: "none", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", marginBottom: "12px", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}
            >
              Ripristina e Riapri App
            </button>

            <button
              onClick={() => reset()}
              style={{ width: "100%", padding: "12px", borderRadius: "14px", background: "transparent", color: "#a8a29e", border: "1px solid #33333d", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}
            >
              Riprova Ricarica Rapida
            </button>

            {error?.message && (
              <details style={{ marginTop: "20px", textAlign: "left", fontSize: "0.75rem", color: "#78716c" }}>
                <summary style={{ cursor: "pointer" }}>Dettagli tecnici</summary>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#111115", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
