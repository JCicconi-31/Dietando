"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { DietApp } from "@/components/DietApp";
import { InstallAppModal } from "@/components/InstallAppModal";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  AuthUser,
  deleteUserAccount,
  getCurrentAuthUser,
  logoutUser,
  purgeLegacyAuthData,
  refreshSession,
} from "@/lib/client-auth";

const noopSubscribe = () => () => {};

/** true solo dopo l'idratazione lato client (false durante il prerendering). */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function LoadingScreen() {
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

export default function HomePage() {
  const isClient = useIsClient();
  if (!isClient) return <LoadingScreen />;
  return <ClientRoot />;
}

function readInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem("diet_theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
  } catch {
    // storage non disponibile
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function ClientRoot() {
  // Profilo in cache: permette di aprire subito l'app (anche offline); la sessione
  // viene poi verificata col server e, se scaduta, si torna alla schermata di accesso.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentAuthUser);
  const [isDark, setIsDark] = useState(readInitialTheme);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const { isStandalone, triggerInstall, hasNativePrompt } = usePwaInstall();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    purgeLegacyAuthData();
    let cancelled = false;
    void refreshSession().then((user) => {
      if (!cancelled) setCurrentUser(user);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      localStorage.setItem("diet_theme", nextDark ? "dark" : "light");
    } catch {
      // storage non disponibile
    }
  };

  const handleLogout = () => {
    void logoutUser();
    setCurrentUser(null);
  };

  const handleDeleteAccount = async (): Promise<string | null> => {
    if (!currentUser) return null;
    const res = await deleteUserAccount(currentUser.id);
    if (!res.success) return res.error || "Impossibile eliminare l'account.";
    setCurrentUser(null);
    return null;
  };

  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onAuthenticated={setCurrentUser}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenInstall={() => setIsInstallOpen(true)}
          isStandalone={isStandalone}
        />
        <InstallAppModal
          isOpen={isInstallOpen}
          onClose={() => setIsInstallOpen(false)}
          hasNativePrompt={hasNativePrompt}
          isStandalone={isStandalone}
          onNativeInstall={triggerInstall}
        />
      </>
    );
  }

  return (
    <DietApp
      key={currentUser.id}
      currentUser={currentUser}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
      onSessionExpired={handleLogout}
      isStandalone={isStandalone}
      hasNativePrompt={hasNativePrompt}
      onNativeInstall={triggerInstall}
    />
  );
}
