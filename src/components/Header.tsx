"use client";

import React from "react";
import { Moon, Sun, WifiOff, ShieldCheck, User, LogOut, Smartphone } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  onOpenPrivacy: () => void;
  onOpenAccount: () => void;
  onOpenInstall?: () => void;
  isStandalone?: boolean;
  onLogout?: () => void;
  currentUserName?: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({
  isOnline,
  onOpenPrivacy,
  onOpenAccount,
  onOpenInstall,
  isStandalone = false,
  onLogout,
  currentUserName = "Utente",
  isDark,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/85 dark:bg-[#151518]/85 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Titolo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-sm sm:text-xl shrink-0 select-none">
            OD
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Organizzatore Dieta</span>
              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                  <WifiOff size={10} /> <span className="hidden xs:inline">Offline</span>
                </span>
              )}
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block truncate">
              Pasti, lista spesa e regole del nutrizionista
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Online badge su desktop */}
          {isOnline ? (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizzato
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <WifiOff size={12} />
              Offline
            </div>
          )}
          
          {/* Pulsante Scarica / Installa App */}
          {onOpenInstall && !isStandalone && (
            <button
              onClick={onOpenInstall}
              title="Installa l'applicazione su Android / Telefono"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500/10 to-amber-500/15 dark:from-orange-500/20 dark:to-amber-500/20 text-[#ea580c] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100/80 dark:hover:bg-orange-950/40 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Smartphone size={15} className="shrink-0 text-[#ea580c] dark:text-orange-400" />
              <span className="font-bold hidden sm:inline">Scarica App</span>
              <span className="font-bold text-[11px] sm:hidden">Installa</span>
            </button>
          )}

          {/* Privacy Button (Desktop / Tablet) */}
          <button
            onClick={onOpenPrivacy}
            title="Privacy e trattamento dati sanitari"
            className="hidden sm:flex p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ShieldCheck size={19} />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Passa a tema chiaro" : "Passa a tema scuro"}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer active:scale-95"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* User Account Button: Avatar compatto su mobile, nome esteso su desktop */}
          <button
            onClick={onOpenAccount}
            title={`Gestione Account: ${currentUserName}`}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer active:scale-95"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-[#ea580c] dark:text-orange-400 flex items-center justify-center font-bold text-[11px] shrink-0">
              {currentUserName ? currentUserName.slice(0, 1).toUpperCase() : <User size={13} />}
            </div>
            <span className="max-w-[90px] truncate hidden sm:inline">{currentUserName}</span>
          </button>

          {/* Logout Button (Desktop) */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Disconnetti"
              className="hidden md:flex p-2 rounded-xl text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
