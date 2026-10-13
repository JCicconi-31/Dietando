"use client";

import React, { useState } from "react";
import { Lock, Mail, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Sun, Moon, Smartphone } from "lucide-react";
import { loginUser, registerUser, AuthUser } from "@/lib/client-auth";

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenInstall?: () => void;
  isStandalone?: boolean;
}

export function AuthScreen({
  onAuthenticated,
  isDark,
  onToggleTheme,
  onOpenInstall,
  isStandalone = false,
}: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [emailOrName, setEmailOrName] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginUser(emailOrName, password);
      if (res.success && res.user) {
        onAuthenticated(res.user);
      } else {
        setError(res.error || "Errore durante l'accesso.");
      }
    } catch {
      setError("Si è verificato un errore imprevisto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await registerUser(registerName, registerEmail, password);
      if (res.success && res.user) {
        onAuthenticated(res.user);
      } else {
        setError(res.error || "Errore durante la registrazione.");
      }
    } catch {
      setError("Si è verificato un errore imprevisto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-[#121215] text-stone-900 dark:text-stone-100 p-4 sm:p-6 transition-colors">
      {/* Top Bar con Logo e Theme Toggle */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-lg">
            OD
          </div>
          <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
            Organizzatore Dieta
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenInstall && !isStandalone && (
            <button
              onClick={onOpenInstall}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Smartphone size={14} />
              <span>Scarica App</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            title={isDark ? "Tema chiaro" : "Tema scuro"}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white dark:bg-[#1a1a1f] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/70 dark:bg-orange-950/50 text-[#ea580c] dark:text-orange-400 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck size={14} /> Accesso Riservato
            </div>
            <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
              {mode === "login" ? "Accedi al tuo Piano" : "Crea il tuo Account"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              I tuoi pasti, le tue preferenze e la tua lista della spesa sono rigorosamente privati e visibili solo a te.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-stone-100 dark:bg-[#25252b] p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "login"
                  ? "bg-white dark:bg-[#32323a] text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "register"
                  ? "bg-white dark:bg-[#32323a] text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              Registrati
            </button>
          </div>

          {/* Alert Errore */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Login */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Email o Nome Utente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrName}
                    onChange={(e) => setEmailOrName(e.target.value)}
                    placeholder="Es. jacopo@email.com o Jacopo"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#202026] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci la tua password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#202026] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#F7931E] hover:bg-[#ea580c] text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                <span>{isLoading ? "Accesso in corso..." : "Accedi al tuo Spazio"}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* Form Registrazione */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Il tuo Nome
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Es. Jacopo"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#202026] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Es. jacopo@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#202026] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Almeno 4 caratteri"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#202026] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#F7931E] hover:bg-[#ea580c] text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                <span>{isLoading ? "Creazione account..." : "Crea Account Personale"}</span>
                <Sparkles size={16} />
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-850 text-center">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-tight">
              Tutti i dati sanitari e i piani spesa rimangono esclusivamente sul tuo dispositivo. Nessun tracciamento o condivisione esterna.
            </p>
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="text-center text-xs text-stone-400 py-3">
        Organizzatore Dieta &bull; Privacy e Salute Garantite
      </div>
    </div>
  );
}
