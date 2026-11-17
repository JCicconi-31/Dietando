"use client";

import { getStorageKeys } from "@/lib/client-store";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * L'autenticazione vera è il cookie httpOnly firmato dal server.
 * In localStorage teniamo solo il profilo (id, nome, email) per poter aprire
 * l'app offline con i dati locali: nessuna password o hash viene salvato sul dispositivo.
 */
const CURRENT_USER_KEY = "diet_current_user";

// Chiavi delle versioni precedenti (contenevano hash delle password): vanno eliminate.
const LEGACY_KEYS = ["diet_registered_users", "diet_current_user_id"];

const OFFLINE_ERROR = "Serve una connessione a internet per accedere o registrarsi.";

function storage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

function isAuthUser(v: unknown): v is AuthUser {
  if (typeof v !== "object" || v === null) return false;
  const u = v as Record<string, unknown>;
  return typeof u.id === "string" && typeof u.email === "string" && typeof u.name === "string";
}

function cacheUser(user: AuthUser | null) {
  const s = storage();
  if (!s) return;
  if (user) s.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else s.removeItem(CURRENT_USER_KEY);
}

export function purgeLegacyAuthData() {
  const s = storage();
  if (!s) return;
  for (const key of LEGACY_KEYS) s.removeItem(key);
}

/** Profilo dell'ultimo utente autenticato su questo dispositivo (lettura sincrona, funziona offline). */
export function getCurrentAuthUser(): AuthUser | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Verifica la sessione col server.
 * - sessione valida → aggiorna la cache e restituisce l'utente
 * - sessione scaduta/assente (401) → svuota la cache e restituisce null
 * - rete non disponibile → restituisce l'utente in cache (modalità offline)
 */
export async function refreshSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.status === 401) {
      cacheUser(null);
      return null;
    }
    const body = await res.json();
    if (res.ok && body.success && isAuthUser(body.user)) {
      cacheUser(body.user);
      return body.user;
    }
  } catch {
    // offline: si continua con il profilo in cache
  }
  return getCurrentAuthUser();
}

async function postAuth(url: string, payload: Record<string, string>): Promise<AuthResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.success && isAuthUser(body.user)) {
      purgeLegacyAuthData();
      cacheUser(body.user);
      return { success: true, user: body.user };
    }
    return { success: false, error: body.error || "Si è verificato un errore. Riprova." };
  } catch {
    return { success: false, error: OFFLINE_ERROR };
  }
}

export async function loginUser(emailOrName: string, password: string): Promise<AuthResult> {
  const query = emailOrName.trim();
  if (!query || !password.trim()) {
    return { success: false, error: "Inserisci sia email/nome utente che la password." };
  }
  return postAuth("/api/auth/login", { emailOrName: query, password });
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim()) return { success: false, error: "Il nome è obbligatorio." };
  if (!email.trim().includes("@")) return { success: false, error: "Inserisci un indirizzo email valido." };
  return postAuth("/api/auth/register", { name: name.trim(), email: email.trim(), password });
}

export async function logoutUser(): Promise<void> {
  cacheUser(null);
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // offline: il cookie resterà finché non scade, ma l'app locale è già disconnessa
  }
}

/** Cancella tutti i dati dell'utente salvati su questo dispositivo. */
export function clearLocalUserData(userId: string) {
  const s = storage();
  if (!s) return;
  for (const key of Object.values(getStorageKeys(userId))) s.removeItem(key);
  if (getCurrentAuthUser()?.id === userId) cacheUser(null);
}

/**
 * Elimina definitivamente l'account sul server (con tutti i dati collegati)
 * e poi ripulisce il dispositivo. Richiede connessione.
 */
export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/account", { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      return { success: false, error: body.error || "Impossibile eliminare l'account. Riprova." };
    }
  } catch {
    return { success: false, error: "Serve una connessione a internet per eliminare l'account." };
  }
  clearLocalUserData(userId);
  return { success: true };
}
