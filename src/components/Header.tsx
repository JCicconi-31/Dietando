"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wifi, WifiOff, ShieldCheck, User } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  onOpenPrivacy: () => void;
  onOpenAccount: () => void;
  currentUserName?: string;
}

export function Header({
  isOnline,
  onOpenPrivacy,
  onOpenAccount,
  currentUserName = "Utente Demo",
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Rileva preferenza tema o classe dark
    const isDarkMode = document.documentElement.classList.contains("dark") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-[#151518]/80 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Titolo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-xl">
            OD
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Organizzatore Dieta
              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <WifiOff size={11} /> Offline
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Pasti, lista spesa e regole del nutrizionista
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Online badge su desktop */}
          {isOnline ? (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizzato
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <WifiOff size={12} />
              Modalità Offline
            </div>
          )}

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            title="Privacy e trattamento dati sanitari"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ShieldCheck size={20} />
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAccount}
            title={`Account: ${currentUserName}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <User size={15} className="text-[#F7931E]" />
            <span className="max-w-[100px] truncate">{currentUserName}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDark ? "Passa a tema chiaro" : "Passa a tema scuro"}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
