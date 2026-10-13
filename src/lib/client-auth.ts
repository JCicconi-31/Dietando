"use client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
  createdAt: string;
}

const AUTH_STORAGE_KEYS = {
  USERS: "diet_registered_users",
  CURRENT_USER_ID: "diet_current_user_id",
};

function isStorageAvailable(): boolean {
  return typeof window !== "undefined" || typeof globalThis.localStorage !== "undefined";
}

// Hashing semplice basato su Web Crypto API per memorizzazione protetta
async function hashClientPassword(password: string): Promise<string> {
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password + "_diet_salt_2026");
      const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback
    }
  }
  if (typeof btoa !== "undefined") {
    return btoa(unescape(encodeURIComponent(password + "_diet_salt_2026")));
  }
  return Buffer.from(password + "_diet_salt_2026").toString("base64");
}

export function getRegisteredUsers(): StoredUser[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCurrentAuthUser(): AuthUser | null {
  if (!isStorageAvailable()) return null;
  try {
    const currentId = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = getRegisteredUsers();
    const found = users.find((u) => u.id === currentId);
    if (!found) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
      return null;
    }
    return {
      id: found.id,
      email: found.email,
      name: found.name,
    };
  } catch {
    return null;
  }
}

export async function loginUser(
  emailOrName: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  if (!isStorageAvailable()) {
    return { success: false, error: "Ambiente non supportato." };
  }

  const query = emailOrName.trim().toLowerCase();
  if (!query || !password) {
    return { success: false, error: "Inserisci sia email/nome utente che la password." };
  }

  const users = getRegisteredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === query || u.name.toLowerCase() === query
  );

  if (!user) {
    return { success: false, error: "Nessun account trovato con queste credenziali." };
  }

  const hash = await hashClientPassword(password);
  if (user.passwordHash !== hash) {
    return { success: false, error: "Password errata. Riprova." };
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, user.id);
  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  if (!isStorageAvailable()) {
    return { success: false, error: "Ambiente non supportato." };
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return { success: false, error: "Il nome è obbligatorio." };
  }
  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    return { success: false, error: "Inserisci un indirizzo email valido." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "La password deve contenere almeno 4 caratteri." };
  }

  const users = getRegisteredUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (existing) {
    return { success: false, error: "Un utente con questo nome o questa email esiste già." };
  }

  const hash = await hashClientPassword(password);
  const newUser: StoredUser = {
    id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    name: trimmedName,
    email: trimmedEmail,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

  return {
    success: true,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  };
}

export function logoutUser(): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
}

export function deleteUserAccount(userId: string): void {
  if (!isStorageAvailable()) return;
  const users = getRegisteredUsers().filter((u) => u.id !== userId);
  localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Cancella tutti i dati salvati per questo specifico utente
  localStorage.removeItem(`diet_plan_${userId}`);
  localStorage.removeItem(`diet_selections_${userId}`);
  localStorage.removeItem(`diet_purchased_${userId}`);
  localStorage.removeItem(`diet_weeks_${userId}`);
  localStorage.removeItem(`diet_fixed_veg_${userId}`);
  localStorage.removeItem(`diet_fixed_veg_grams_${userId}`);

  const currentId = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
  if (currentId === userId) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
  }
}
