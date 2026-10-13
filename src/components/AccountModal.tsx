"use client";

import React, { useState } from "react";
import { X, UserPlus, Check, Users } from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onSwitchUser: (userName: string) => void;
}

export function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}: AccountModalProps) {
  const [newUserName, setNewUserName] = useState("");
  const availableUsers = ["Utente Demo", "Jacopo", "Amico 1 (Marco)", "Amico 2 (Chiara)"];

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    onSwitchUser(newUserName.trim());
    setNewUserName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
            <Users size={20} className="text-[#F7931E]" />
            Multi-Utente (Dati Isolati)
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Ogni utente ha un profilo completamente separato. I piani alimentari, le scelte dei pasti e
          le liste della spesa sono rigorosamente isolati.
        </p>

        {/* Elenco Utenti */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Profili Rapidi
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {availableUsers.map((u) => {
              const isCurrent = currentUser === u;
              return (
                <button
                  key={u}
                  onClick={() => {
                    onSwitchUser(u);
                    onClose();
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isCurrent
                      ? "bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-[#ea580c] dark:text-orange-400"
                      : "bg-stone-50 dark:bg-[#222227] hover:bg-stone-100 dark:hover:bg-[#28282e] text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <span>{u}</span>
                  {isCurrent && <Check size={16} className="text-[#F7931E]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aggiungi Nuovo Utente */}
        <form onSubmit={handleCreateUser} className="pt-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Aggiungi Profilo Amico
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Es. Luca"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#202025] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#F7931E]"
            />
            <button
              type="submit"
              disabled={!newUserName.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F7931E] hover:bg-[#ea580c] disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
            >
              <UserPlus size={14} />
              <span>Aggiungi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
