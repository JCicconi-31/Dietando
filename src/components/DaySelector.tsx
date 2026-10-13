"use client";

import React from "react";
import { DayOfWeek } from "@/types/diet";

export const DAYS_INFO: { key: DayOfWeek; short: string; label: string }[] = [
  { key: "LUNEDI", short: "Lun", label: "Lunedì" },
  { key: "MARTEDI", short: "Mar", label: "Martedì" },
  { key: "MERCOLEDI", short: "Mer", label: "Mercoledì" },
  { key: "GIOVEDI", short: "Gio", label: "Giovedì" },
  { key: "VENERDI", short: "Ven", label: "Venerdì" },
  { key: "SABATO", short: "Sab", label: "Sabato" },
  { key: "DOMENICA", short: "Dom", label: "Domenica" },
];

/**
 * Calcola il giorno corrente corrispondente all'enum DayOfWeek
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 è Domenica, 1 è Lunedì, ecc.
  switch (dayIndex) {
    case 1:
      return "LUNEDI";
    case 2:
      return "MARTEDI";
    case 3:
      return "MERCOLEDI";
    case 4:
      return "GIOVEDI";
    case 5:
      return "VENERDI";
    case 6:
      return "SABATO";
    case 0:
    default:
      return "DOMENICA";
  }
}

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  currentDay?: DayOfWeek;
}

export function DaySelector({ selectedDay, onSelectDay, currentDay = "LUNEDI" }: DaySelectorProps) {

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-1.5 min-w-max px-1">
        {DAYS_INFO.map((d) => {
          const isSelected = selectedDay === d.key;
          const isToday = currentDay === d.key;

          return (
            <button
              key={d.key}
              onClick={() => onSelectDay(d.key)}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? "bg-[#F7931E] text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                  : "bg-white dark:bg-[#1f1f23] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-700"
              }`}
            >
              <span>{d.short}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1 rounded-full uppercase tracking-wider font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                  }`}
                >
                  Oggi
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
