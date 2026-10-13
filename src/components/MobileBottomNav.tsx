"use client";

import React from "react";
import { Clock, Calendar, ShoppingBag, ShieldCheck } from "lucide-react";

export type NavTab = "OGGI" | "SETTIMANA" | "SPESA" | "REGOLE";

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  todayShortLabel?: string;
  unpurchasedCount?: number;
  rulesCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  todayShortLabel = "Oggi",
  unpurchasedCount = 0,
  rulesCount = 0,
}: MobileBottomNavProps) {
  const tabs: {
    id: NavTab;
    label: string;
    subLabel?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
  }[] = [
    {
      id: "OGGI",
      label: "Oggi",
      subLabel: todayShortLabel,
      icon: Clock,
    },
    {
      id: "SETTIMANA",
      label: "Settimana",
      icon: Calendar,
    },
    {
      id: "SPESA",
      label: "Spesa",
      icon: ShoppingBag,
      badge: unpurchasedCount > 0 ? unpurchasedCount : undefined,
    },
    {
      id: "REGOLE",
      label: "Regole",
      icon: ShieldCheck,
      badge: rulesCount > 0 ? rulesCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Navigazione principale mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#141418]/90 border-t border-stone-200/80 dark:border-stone-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 transition-colors"
    >
      <div className="max-w-md mx-auto px-3 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all active:scale-95 cursor-pointer select-none ${
                isActive
                  ? "text-[#F7931E] font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
              }`}
            >
              {/* Icon Container con indicatore attivo */}
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-orange-500/15 dark:bg-orange-500/25 text-[#ea580c] dark:text-[#F7931E]"
                    : "bg-transparent"
                }`}
              >
                <Icon size={20} />

                {/* Badge conteggio (es. elementi spesa da comprare) */}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-xs ${
                      isActive
                        ? "bg-[#ea580c] text-white"
                        : "bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>

              {/* Etichetta */}
              <span className="text-[11px] leading-none tracking-tight">
                {tab.label}
              </span>

              {/* Barra indicatore attiva inferiore */}
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-[#F7931E] mt-0.5 animate-in fade-in zoom-in-50 duration-150" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
