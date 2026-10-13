"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  ClipboardList,
  Clock,
  ArrowRight,
  Info,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { DaySelector, getCurrentDayOfWeek, DAYS_INFO } from "@/components/DaySelector";
import { MealCard } from "@/components/MealCard";
import { ShoppingListView } from "@/components/ShoppingListView";
import { ImportJsonModal } from "@/components/ImportJsonModal";
import { PrivacyModal } from "@/components/PrivacyModal";
import { AccountModal } from "@/components/AccountModal";
import { AuthScreen } from "@/components/AuthScreen";
import { EmptyPlanState } from "@/components/EmptyPlanState";
import { validateDietRules } from "@/lib/rules-validator";
import { useDietStore } from "@/lib/client-store";
import { getCurrentAuthUser, logoutUser, deleteUserAccount, AuthUser } from "@/lib/client-auth";
import { DayOfWeek } from "@/types/diet";

export default function HomePage() {
  // Gestione Autenticazione (Accesso Obbligatorio)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Gestione Tema Chiaro / Scuro (Salvato in localStorage)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 1. Inizializza tema
    const savedTheme = localStorage.getItem("diet_theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(systemDark);
      if (systemDark) {
        document.documentElement.classList.add("dark");
      }
    }

    // 2. Inizializza utente autenticato
    const user = getCurrentAuthUser();
    setCurrentUser(user);
    setIsAuthLoading(false);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("diet_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("diet_theme", "light");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      deleteUserAccount(currentUser.id);
      setCurrentUser(null);
    }
  };

  // Store dati isolato per l'utente loggato
  const {
    plan,
    selections,
    purchasedItems,
    weeksCount,
    addFixedVegetables,
    fixedVegetableGrams,
    isOnline,
    setOption,
    toggleFreeMeal,
    togglePurchased,
    setWeeksCount,
    setAddFixedVegetables,
    setFixedVegetableGrams,
    resetPurchased,
    updateCustomPlan,
    removePlan,
    loadSamplePlan,
  } = useDietStore(currentUser?.id);

  const [activeTab, setActiveTab] = useState<"OGGI" | "SETTIMANA" | "SPESA" | "REGOLE">("OGGI");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("LUNEDI");
  const [todayKey, setTodayKey] = useState<DayOfWeek>("LUNEDI");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isImportJsonOpen, setIsImportJsonOpen] = useState(false);

  useEffect(() => {
    const today = getCurrentDayOfWeek();
    setTodayKey(today);
    setSelectedDay(today);
  }, []);

  // Mostra schermata di caricamento durante il check sessione
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#121215]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#F7931E] flex items-center justify-center text-white font-black text-xl animate-pulse">
            OD
          </div>
          <span className="text-xs font-semibold text-stone-500">Caricamento in corso...</span>
        </div>
      </div>
    );
  }

  // 1. Se non autenticato, mostra obbligatoriamente la schermata di login / registrazione
  if (!currentUser) {
    return (
      <AuthScreen
        onAuthenticated={(user) => setCurrentUser(user)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const todayDayPlan = plan?.days.find((d) => d.dayOfWeek === todayKey) || plan?.days[0];
  const activeDayPlan = plan?.days.find((d) => d.dayOfWeek === selectedDay) || plan?.days[0];

  const todayLabel = DAYS_INFO.find((d) => d.key === todayKey)?.label || "Oggi";
  const selectedDayLabel = DAYS_INFO.find((d) => d.key === selectedDay)?.label || "Lunedì";

  const handleDeleteAllData = () => {
    if (currentUser) {
      deleteUserAccount(currentUser.id);
      setCurrentUser(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] dark:bg-[#121215] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header Sticky con gestione tema e utente */}
      <Header
        isOnline={isOnline}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onLogout={handleLogout}
        currentUserName={currentUser.name}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Caso 3: Nessun piano presente per questo utente -> Schermata di avviso inserimento */}
        {!plan ? (
          <EmptyPlanState
            userName={currentUser.name}
            onOpenImport={() => setIsImportJsonOpen(true)}
            onLoadSample={loadSamplePlan}
          />
        ) : (
          <>
            {/* Banner Titolo Piano Attivo */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-500/20 dark:via-amber-500/10 p-4 sm:p-5 rounded-3xl border border-orange-200/50 dark:border-orange-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#ea580c] dark:text-orange-400 uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Piano Nutrizionale di {currentUser.name}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                  {plan.title}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1">
                  {plan.notes || "Nessuna nota aggiuntiva."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsImportJsonOpen(true)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-[#F7931E] hover:bg-[#ea580c] text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Sostituisci Piano (JSON)</span>
                </button>
                <button
                  onClick={() => setActiveTab("REGOLE")}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#202025] border border-orange-200 dark:border-orange-850 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-[#ea580c] dark:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardList size={14} />
                  <span>{plan.rules?.length || 0} Regole</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Vuoi rimuovere questo piano alimentare?")) {
                      removePlan();
                    }
                  }}
                  title="Rimuovi questo piano"
                  className="text-xs font-semibold p-2 rounded-xl bg-white dark:bg-[#202025] border border-stone-200 dark:border-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Tab Navigation: Mobile First */}
            <div className="flex items-center bg-stone-200/70 dark:bg-[#1c1c20] p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab("OGGI")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "OGGI"
                    ? "bg-white dark:bg-[#2b2b32] text-[#F7931E] shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Clock size={16} />
                <span>Oggi</span>
              </button>

              <button
                onClick={() => setActiveTab("SETTIMANA")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "SETTIMANA"
                    ? "bg-white dark:bg-[#2b2b32] text-[#F7931E] shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Calendar size={16} />
                <span>Settimana</span>
              </button>

              <button
                onClick={() => setActiveTab("SPESA")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "SPESA"
                    ? "bg-white dark:bg-[#2b2b32] text-[#F7931E] shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <ShoppingBag size={16} />
                <span>Lista Spesa</span>
              </button>
            </div>

            {/* TAB 1: PRIORITÀ OGGI */}
            {activeTab === "OGGI" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>Menu di Oggi ({todayLabel})</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                        In tempo reale
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Visualizza o cambia al volo l&apos;opzione che desideri mangiare oggi.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDay(todayKey);
                      setActiveTab("SETTIMANA");
                    }}
                    className="text-xs font-semibold text-[#F7931E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Vedi settimana</span> <ArrowRight size={13} />
                  </button>
                </div>

                {/* Pasti di Oggi */}
                <div className="space-y-3">
                  {todayDayPlan?.meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      dayOfWeek={todayKey}
                      selection={selections[`${todayKey}_${meal.mealType}`]}
                      addFixedVegetables={addFixedVegetables}
                      fixedVegetableGrams={fixedVegetableGrams}
                      onSelectOption={(optId) => setOption(todayKey, meal.mealType, optId)}
                      onToggleFreeMeal={() => toggleFreeMeal(todayKey, meal.mealType)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: MENU DELLA SETTIMANA */}
            {activeTab === "SETTIMANA" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                      Menu della Settimana: {selectedDayLabel}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Pianifica i pasti per ciascun giorno scegliendo tra le opzioni o impostando pasti liberi.
                    </p>
                  </div>
                </div>

                {/* Selettore Giorno */}
                <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} currentDay={todayKey} />

                {/* Pasti del Giorno Selezionato */}
                <div className="space-y-3 pt-1">
                  {activeDayPlan?.meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      dayOfWeek={selectedDay}
                      selection={selections[`${selectedDay}_${meal.mealType}`]}
                      addFixedVegetables={addFixedVegetables}
                      fixedVegetableGrams={fixedVegetableGrams}
                      onSelectOption={(optId) => setOption(selectedDay, meal.mealType, optId)}
                      onToggleFreeMeal={() => toggleFreeMeal(selectedDay, meal.mealType)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LISTA DELLA SPESA CALCOLATA */}
            {activeTab === "SPESA" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    Lista della Spesa Intelligente di {currentUser.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Calcolata esattamente sulle opzioni scelte, raggruppata per reparto con conversione automatica in kg/l.
                  </p>
                </div>

                <ShoppingListView
                  plan={plan}
                  selections={selections}
                  purchasedItems={purchasedItems}
                  weeksCount={weeksCount}
                  addFixedVegetables={addFixedVegetables}
                  fixedVegetableGrams={fixedVegetableGrams}
                  onTogglePurchased={togglePurchased}
                  onResetPurchased={resetPurchased}
                  onSetWeeksCount={setWeeksCount}
                  onToggleFixedVegetables={setAddFixedVegetables}
                />
              </div>
            )}

            {/* TAB 4: REGOLE DEL PIANO */}
            {activeTab === "REGOLE" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                      Regole e Vincoli del Nutrizionista
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Queste regole definiscono le frequenze settimanali consigliate dal nutrizionista.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("OGGI")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    Torna a Oggi
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {validateDietRules(plan, selections).map((res) => {
                    const rule = plan.rules.find((r) => r.id === res.ruleId);
                    const isPassed = res.passed;

                    return (
                      <div
                        key={res.ruleId}
                        className={`p-4 rounded-2xl border shadow-sm space-y-2 transition-all ${
                          isPassed
                            ? "bg-white dark:bg-[#1a1a1e] border-stone-200 dark:border-stone-800"
                            : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] dark:text-orange-400">
                            {res.category || res.type}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isPassed
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-200 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200"
                            }`}
                          >
                            {isPassed ? "Rispettata" : "Attenzione"}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                          {rule?.description || res.message}
                        </p>

                        <div className="text-xs text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-850">
                          {res.message}
                        </div>

                        {rule?.exceptions && rule.exceptions.length > 0 && (
                          <div className="text-[11px] text-stone-400 dark:text-stone-500">
                            Eccezioni ammesse: {rule.exceptions.join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Note Generali */}
                {plan.notes && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Info size={15} /> Note del nutrizionista:
                    </span>
                    <p className="leading-relaxed">{plan.notes}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modali */}
      <ImportJsonModal
        isOpen={isImportJsonOpen}
        onClose={() => setIsImportJsonOpen(false)}
        onPlanImported={(newPlan) => {
          updateCustomPlan(newPlan);
          setActiveTab("OGGI");
        }}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onDeleteAllData={handleDeleteAllData}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onResetPlan={removePlan}
        hasActivePlan={!!plan}
      />
    </div>
  );
}
