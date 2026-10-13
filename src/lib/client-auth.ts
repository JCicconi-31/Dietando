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
  return (
    typeof window !== "undefined" ||
    (typeof globalThis !== "undefined" && typeof globalThis.localStorage !== "undefined")
  );
}

function canFetchApi(): boolean {
  return typeof window !== "undefined" && Boolean(window.location?.origin);
}

// Hashing semplice basato su Web Crypto API per fallback offline
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

// Sincronizza eventuali utenti creati precedentemente in locale verso il database server PostgreSQL
export async function syncLocalUsersToServer(): Promise<void> {
  if (!isStorageAvailable() || !canFetchApi()) return;
  try {
    const localUsers = getRegisteredUsers();
    if (localUsers.length === 0) return;

    await fetch("/api/auth/sync-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: localUsers }),
    });
  } catch (err) {
    // Offline o errore di rete silenziato
    console.debug("Sync locale utenti non riuscita (offline o non disponibile):", err);
  }
}

// Avvia sincronizzazione locale automatica se siamo nel browser
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncLocalUsersToServer().catch(() => {});
  }, 100);
}

export function getCurrentAuthUser(): AuthUser | null {
  if (!isStorageAvailable()) return null;
  try {
    const currentId = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = getRegisteredUsers();
    const found = users.find((u) => u.id === currentId);
    if (!found) {
      // Se non trovato nell'elenco locale, ma abbiamo l'ID salvato
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
  const query = emailOrName.trim();
  const trimmedPassword = password.trim();

  if (!query || !trimmedPassword) {
    return { success: false, error: "Inserisci sia email/nome utente che la password." };
  }

  // 1. Assicurati che eventuali account salvati solo in locale su questo dispositivo vengano inviati al server
  await syncLocalUsersToServer();

  // 2. Tenta prima il login centralizzato tramite il server PostgreSQL
  if (canFetchApi()) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrName: query, password: trimmedPassword }),
      });

    const data = await res.json();

    if (res.ok && data.success && data.user) {
      if (isStorageAvailable()) {
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, data.user.id);
        
        // Memorizza/aggiorna anche in locale per permettere l'accesso offline
        const users = getRegisteredUsers();
        const existingIdx = users.findIndex((u) => u.id === data.user.id);
        const hash = await hashClientPassword(trimmedPassword);
        const storedUser: StoredUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          passwordHash: hash,
          createdAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          users[existingIdx] = storedUser;
        } else {
          users.push(storedUser);
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      return { success: true, user: data.user };
    }

    if (data.error) {
      // Se il server ha risposto con credenziali errate
      // Controlliamo se per caso è un utente locale non ancora sincronizzato
      const localUsers = getRegisteredUsers();
      const localFound = localUsers.find(
        (u) =>
          u.email.toLowerCase() === query.toLowerCase() ||
          u.name.toLowerCase() === query.toLowerCase()
      );

      if (localFound) {
        const hash = await hashClientPassword(trimmedPassword);
        if (localFound.passwordHash === hash) {
          // Ha inserito la password giusta del suo account locale! Sincronizziamolo subito al server
          await fetch("/api/auth/sync-local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: [localFound] }),
          }).catch(() => {});

          if (isStorageAvailable()) {
            localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, localFound.id);
          }
          return { success: true, user: localFound };
        }
      }

        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn("Server login non raggiungibile, fallback locale:", err);
    }
  }

  // 3. Fallback locale (offline)
  if (!isStorageAvailable()) {
    return { success: false, error: "Ambiente non supportato." };
  }

  const users = getRegisteredUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === query.toLowerCase() ||
      u.name.toLowerCase() === query.toLowerCase()
  );

  if (!user) {
    return { success: false, error: "Nessun account trovato con queste credenziali." };
  }

  const hash = await hashClientPassword(trimmedPassword);
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
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedName) {
    return { success: false, error: "Il nome è obbligatorio." };
  }
  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    return { success: false, error: "Inserisci un indirizzo email valido." };
  }
  if (!trimmedPassword || trimmedPassword.length < 4) {
    return { success: false, error: "La password deve contenere almeno 4 caratteri." };
  }

  // 1. Tenta la registrazione sul server PostgreSQL
  if (canFetchApi()) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (isStorageAvailable()) {
          localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, data.user.id);
          
          // Cache locale per offline
          const hash = await hashClientPassword(trimmedPassword);
          const users = getRegisteredUsers();
          users.push({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            passwordHash: hash,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        return { success: true, user: data.user };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn("Server register non raggiungibile, fallback locale:", err);
    }
  }

  // 2. Fallback locale (offline)
  if (!isStorageAvailable()) {
    return { success: false, error: "Ambiente non supportato." };
  }

  const users = getRegisteredUsers();
  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === trimmedEmail ||
      u.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (existing) {
    return { success: false, error: "Un utente con questo nome o questa email esiste già." };
  }

  const hash = await hashClientPassword(trimmedPassword);
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

  localStorage.removeItem(`diet_plan_${userId}`);
  localStorage.removeItem(`diet_selections_${userId}`);
  localStorage.removeItem(`diet_purchased_${userId}`);
  localStorage.removeItem(`diet_weeks_${userId}`);
  localStorage.removeItem(`diet_fixed_veg_${userId}`);
  localStorage.removeItem(`diet_fixed_veg_grams_${userId}`);
  localStorage.removeItem(`diet_shopping_days_${userId}`);

  const currentId = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
  if (currentId === userId) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
  }
}
